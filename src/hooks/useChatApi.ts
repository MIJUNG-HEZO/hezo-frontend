"use client";

import { useState, useCallback } from "react";
import { sendChatMessage, type ChatResponse } from "@/lib/api";

export interface ChatBubble {
  role: "user" | "assistant";
  content: string;
}

export function useChatApi(siteId: string) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnStatus, setTurnStatus] = useState<ChatResponse["turn_status"] | null>(null);

  const sendMessage = useCallback(
    async (sessionId: string, userText: string, domain = "", templateId = "") => {
      if (!userText.trim() || loading) return;
      setError(null);

      setMessages((prev) => [...prev, { role: "user", content: userText }]);
      setLoading(true);

      try {
        const res = await sendChatMessage(siteId, {
          session_id: sessionId,
          user_message: userText,
          domain,
          template_id: templateId,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.assistant_message },
        ]);
        setTurnStatus(res.turn_status);
        return res;
      } catch {
        const errMsg = "응답을 받지 못했습니다. 다시 시도해주세요.";
        setError(errMsg);
        setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
      } finally {
        setLoading(false);
      }
    },
    [siteId, loading],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setTurnStatus(null);
  }, []);

  return { messages, loading, error, turnStatus, sendMessage, clearMessages };
}
