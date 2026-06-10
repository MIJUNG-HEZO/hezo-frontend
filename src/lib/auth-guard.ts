// 인증 유틸리티 — JWT 토큰 기반

import { logoutApi } from "@/lib/api";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function logout() {
  // 서버 refresh 토큰 무효화는 best-effort (쿠키 기반) — 응답을 기다리지 않는다.
  void logoutApi();
  localStorage.removeItem("access_token");
  localStorage.removeItem("hezo_user_plan");
}
