"use client";

import { useState, useEffect, useRef } from "react";
import { getPipelineStatus, type PipelineStatusResponse } from "@/lib/api";

const POLL_INTERVAL_MS = 3000;

export function usePipelinePoller(siteId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<PipelineStatusResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !siteId) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPolling(false);
      return;
    }

    setPolling(true);
    const poll = () =>
      getPipelineStatus(siteId)
        .then(setStatus)
        .catch(() => {});

    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPolling(false);
    };
  }, [siteId, enabled]);

  const done =
    status?.pipeline_status === "published" ||
    status?.pipeline_status === "generation_failed";

  return { status, polling: polling && !done };
}
