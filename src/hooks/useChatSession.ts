"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatRemainingTime } from "@/lib/utils";

/** 세션 지속 시간: 10분 (600초) */
const SESSION_DURATION = 600;

/** 최대 재생성 횟수 */
const MAX_REGENERATIONS = 2;

/** 챗봇 세션 상태 인터페이스 */
export interface ChatSessionState {
  sessionId: string;
  startedAt: number | null;
  remainingSeconds: number;
  isExpired: boolean;
  regenerationCount: number;
}

/** 간단한 UUID-like 문자열을 생성한다. */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback: 간단한 랜덤 ID 생성
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * useChatSession - 챗봇 세션 관리 커스텀 훅
 *
 * 세션 시작 시각 기록, 10분 카운트다운, 만료 처리, 재생성 횟수 제한을 관리한다.
 *
 * 관련 요구사항:
 * - Req 3.1: 첫 메시지 전송 시 10분 타이머 시작
 * - Req 3.2: 남은 시간 분:초 형식 표시
 * - Req 3.3: 10분 경과 시 세션 만료 처리
 * - Req 3.4: 만료 후 메시지 전송 거부
 * - Req 3.5: 새 세션 시작 시 상태 초기화
 * - Req 3.6: 모든 플랜에 동일 적용
 * - Req 4.1: 재생성 횟수 확인
 * - Req 4.2: 2회 미만 시 재생성 허용
 * - Req 4.3: 2회 도달 시 재생성 거부
 * - Req 4.5: 최초 프리뷰는 재생성 횟수 미포함
 * - Req 4.6: 새 세션 시작 시 재생성 횟수 0 초기화
 */
export function useChatSession() {
  const [sessionState, setSessionState] = useState<ChatSessionState>({
    sessionId: generateSessionId(),
    startedAt: null,
    remainingSeconds: SESSION_DURATION,
    isExpired: false,
    regenerationCount: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1초마다 남은 시간을 업데이트하는 카운트다운 타이머
  useEffect(() => {
    if (sessionState.startedAt === null || sessionState.isExpired) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setSessionState((prev) => {
        if (prev.startedAt === null || prev.isExpired) {
          return prev;
        }

        const elapsed = Math.floor((Date.now() - prev.startedAt) / 1000);
        const remaining = Math.max(0, SESSION_DURATION - elapsed);

        if (remaining <= 0) {
          return {
            ...prev,
            remainingSeconds: 0,
            isExpired: true,
          };
        }

        return {
          ...prev,
          remainingSeconds: remaining,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionState.startedAt, sessionState.isExpired]);

  /**
   * 세션을 시작한다. 첫 메시지 전송 시 호출하여 startedAt을 기록하고 카운트다운을 시작한다.
   * 이미 시작된 세션이면 무시한다.
   */
  const startSession = useCallback(() => {
    setSessionState((prev) => {
      if (prev.startedAt !== null) {
        return prev; // 이미 시작됨
      }
      return {
        ...prev,
        startedAt: Date.now(),
      };
    });
  }, []);

  /**
   * 메시지를 전송한다. 세션이 만료된 경우 false를 반환한다.
   * 세션이 시작되지 않았으면 자동으로 시작한다.
   * @returns boolean - 전송 가능 여부
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendMessage = useCallback((_content: string): boolean => {
    let canSend = false;

    setSessionState((prev) => {
      if (prev.isExpired) {
        canSend = false;
        return prev;
      }

      canSend = true;

      // 첫 메시지 시 세션 시작
      if (prev.startedAt === null) {
        return {
          ...prev,
          startedAt: Date.now(),
        };
      }

      return prev;
    });

    return canSend;
  }, []);

  /**
   * 프리뷰 재생성을 요청한다.
   * 재생성 횟수가 MAX_REGENERATIONS(2) 이상이면 false를 반환한다.
   * 최초 프리뷰 생성은 별도로 호출하며, 이 함수는 "재생성"만 카운트한다.
   * @returns boolean - 재생성 허용 여부
   */
  const requestRegeneration = useCallback((): boolean => {
    let allowed = false;

    setSessionState((prev) => {
      if (prev.regenerationCount >= MAX_REGENERATIONS) {
        allowed = false;
        return prev;
      }

      allowed = true;
      return {
        ...prev,
        regenerationCount: prev.regenerationCount + 1,
      };
    });

    return allowed;
  }, []);

  /**
   * 새 세션을 시작한다.
   * 모든 상태를 초기화하고 새 sessionId를 발급한다.
   * 기존 타이머를 정리한다.
   */
  const startNewSession = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSessionState({
      sessionId: generateSessionId(),
      startedAt: null,
      remainingSeconds: SESSION_DURATION,
      isExpired: false,
      regenerationCount: 0,
    });
  }, []);

  return {
    sessionState,
    startSession,
    sendMessage,
    requestRegeneration,
    startNewSession,
    formatTime: formatRemainingTime,
  };
}

export { SESSION_DURATION, MAX_REGENERATIONS };
