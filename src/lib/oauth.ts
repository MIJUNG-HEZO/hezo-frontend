// 소셜 로그인(카카오/네이버) 인가코드 흐름 헬퍼.
//
// 흐름: 버튼 클릭 → 제공자 authorize 페이지로 이동 → 제공자가
// `${origin}/oauth/{provider}/callback?code=...` 로 리다이렉트 → 콜백 페이지가
// code 를 백엔드(POST /auth/oauth/{provider})로 교환.
//
// 동작하려면:
//  - 프론트 .env.local: NEXT_PUBLIC_KAKAO_CLIENT_ID, NEXT_PUBLIC_NAVER_CLIENT_ID
//  - 백엔드 .env: KAKAO_CLIENT_SECRET, NAVER_CLIENT_SECRET (+ 동일 CLIENT_ID)
//  - 제공자 콘솔에 redirect_uri 등록: http://localhost:3000/oauth/{provider}/callback

import type { OAuthProvider } from "@/lib/api";

const AUTHORIZE_ENDPOINT: Record<OAuthProvider, string> = {
  kakao: "https://kauth.kakao.com/oauth/authorize",
  naver: "https://nid.naver.com/oauth2.0/authorize",
};

const NAVER_STATE_KEY = "hezo_oauth_naver_state";

export function getOAuthClientId(provider: OAuthProvider): string | undefined {
  return provider === "kakao"
    ? process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID
    : process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
}

/** authorize 요청과 토큰 교환에서 동일하게 써야 하는 redirect_uri. */
export function oauthRedirectUri(provider: OAuthProvider): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return `${origin}/oauth/${provider}/callback`;
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 제공자 로그인 페이지로 이동. 클라이언트 ID 미설정이면 false 반환(이동 안 함). */
export function startOAuthLogin(provider: OAuthProvider): boolean {
  const clientId = getOAuthClientId(provider);
  if (!clientId) return false;

  const redirectUri = oauthRedirectUri(provider);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (provider === "naver") {
    const state = randomState();
    sessionStorage.setItem(NAVER_STATE_KEY, state);
    params.set("state", state);
  }

  window.location.href = `${AUTHORIZE_ENDPOINT[provider]}?${params.toString()}`;
  return true;
}

/** 네이버 콜백에서 state 검증(저장된 값과 비교 후 소비). */
export function consumeNaverState(): string | null {
  const state = sessionStorage.getItem(NAVER_STATE_KEY);
  sessionStorage.removeItem(NAVER_STATE_KEY);
  return state;
}
