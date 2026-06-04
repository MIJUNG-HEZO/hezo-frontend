import ky from "ky";
import type { SubscriptionStatus, UpgradeResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  get: (url: string) =>
    ky.get(`${API_BASE_URL}/${url}`, { headers: getAuthHeaders(), timeout: 30000 }),

  post: (url: string, options?: { json?: unknown }) =>
    ky.post(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  patch: (url: string, options?: { json?: unknown }) =>
    ky.patch(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  put: (url: string, options?: { json?: unknown }) =>
    ky.put(`${API_BASE_URL}/${url}`, { json: options?.json, headers: getAuthHeaders(), timeout: 30000 }),

  delete: (url: string) =>
    ky.delete(`${API_BASE_URL}/${url}`, { headers: getAuthHeaders(), timeout: 30000 }),
};

// --- Subscription API 클라이언트 함수 ---

/**
 * 현재 사용자의 구독 상태를 조회한다.
 * GET /api/v1/subscription/status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return api.get("api/v1/subscription/status").json<SubscriptionStatus>();
}

/**
 * 플랜 업그레이드를 요청한다.
 * POST /api/v1/subscription/upgrade
 * @param targetPlan - 업그레이드 대상 플랜 ("pro" | "enterprise")
 */
export async function upgradePlan(targetPlan: string): Promise<UpgradeResult> {
  return api
    .post("api/v1/subscription/upgrade", { json: { target_plan: targetPlan } })
    .json<UpgradeResult>();
}

/**
 * 사이트를 발급(퍼블리시)한다.
 * POST /api/v1/sites/{siteId}/publish
 * @param siteId - 발급할 사이트 ID
 */
export async function publishSite(siteId: string): Promise<{ status: string; domain: string }> {
  return api
    .post(`api/v1/sites/${siteId}/publish`)
    .json<{ status: string; domain: string }>();
}
