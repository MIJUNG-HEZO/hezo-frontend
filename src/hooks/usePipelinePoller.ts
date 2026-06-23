"use client";

import { useState, useEffect, useRef } from "react";
import { getPipelineStatus, type PipelineStatusResponse } from "@/lib/api";

// provisioning(CFn 생성 중)은 느리게 폴링
const POLL_FAST_MS = 3000;
const POLL_SLOW_MS = 10000;

const TERMINAL_STATUSES = new Set([
  "published",
  "generation_failed",
  "failed",
  "rolled_back",
]);

export function usePipelinePoller(siteId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<PipelineStatusResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !siteId) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPolling(false);
      return;
    }

    let active = true;
    setPolling(true);

    const poll = async () => {
      if (!active) return;
      try {
        const s = await getPipelineStatus(siteId);
        if (!active) return;
        setStatus(s);
        if (TERMINAL_STATUSES.has(s.pipeline_status)) {
          setPolling(false);
          return;
        }
        // provisioning 중이면 느리게, 그 외엔 빠르게
        const interval =
          s.pipeline_status === "provisioning" ? POLL_SLOW_MS : POLL_FAST_MS;
        timerRef.current = setTimeout(poll, interval);
      } catch {
        if (!active) return;
        timerRef.current = setTimeout(poll, POLL_FAST_MS);
      }
    };

    poll();

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      setPolling(false);
    };
  }, [siteId, enabled]);

  const done = status ? TERMINAL_STATUSES.has(status.pipeline_status) : false;

  return { status, polling: polling && !done };
}
