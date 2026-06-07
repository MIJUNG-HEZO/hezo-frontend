import ky, { isHTTPError, type BeforeErrorHook } from "ky";
import type { SubscriptionStatus, UpgradeResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// 401 시 토큰 제거 및 리다이렉트 (향후 refresh 로직 추가 예정)
const handle401: BeforeErrorHook = ({ error }) => {
  if (isHTTPError(error) && error.response.status === 401) {
    localStorage.removeItem("access_token");
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
  }
  return error;
};

export const api = ky.create({
  prefix: API_BASE_URL,
  timeout: 30000,
  credentials: "include",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeError: [handle401],
  },
});

// --- Subscription API ---
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return api.get("api/v1/subscription/status").json<SubscriptionStatus>();
}

export async function upgradePlan(targetPlan: string): Promise<UpgradeResult> {
  return api.post("api/v1/subscription/upgrade", { json: { target_plan: targetPlan } }).json<UpgradeResult>();
}

export async function publishSite(siteId: string): Promise<{ status: string; domain: string }> {
  return api.post(`api/v1/sites/${siteId}/publish`).json<{ status: string; domain: string }>();
}
