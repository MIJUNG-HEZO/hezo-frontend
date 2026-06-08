import ky, { isHTTPError, type BeforeErrorHook } from "ky";
import type { SubscriptionStatus, UpgradeResult, MySubscriptionResponse } from "@/types";

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

// plan_code를 프론트 plan 표시명으로 매핑
function mapPlanCode(code: string): "starter" | "pro" | "enterprise" {
  const map: Record<string, "starter" | "pro" | "enterprise"> = {
    FREE: "starter",
    PRO: "pro",
    MAX: "enterprise",
  };
  return map[code] || "starter";
}

function getNextPlan(code: string): string | null {
  const map: Record<string, string | null> = {
    FREE: "PRO",
    PRO: "MAX",
    MAX: null,
  };
  return map[code] ?? null;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  // 백엔드 팀 API: GET /api/v1/subscriptions/me
  const data = await api.get("api/v1/subscriptions/me").json<MySubscriptionResponse>();
  const { subscription } = data;
  const plan = subscription.plan;

  // 사이트 수 조회 (published 기준)
  let sitesUsed = 0;
  try {
    const sites = await api.get("api/v1/sites").json<{ id: string; status: string }[]>();
    sitesUsed = sites.filter((s) => s.status === "published" || s.is_published).length;
  } catch {
    // sites 조회 실패 시 0으로 유지
  }

  return {
    plan: mapPlanCode(plan.code),
    plan_code: plan.code,
    plan_name: plan.name,
    sites_used: sitesUsed,
    sites_limit: plan.max_sites,
    can_upgrade: plan.code !== "MAX",
    can_publish: plan.can_publish,
    next_plan: getNextPlan(plan.code),
    plan_updated_at: subscription.started_at,
  };
}

export async function upgradePlan(targetPlan: string): Promise<UpgradeResult> {
  return api.post("api/v1/subscription/upgrade", { json: { target_plan: targetPlan } }).json<UpgradeResult>();
}

export async function publishSite(siteId: string): Promise<{ status: string; domain: string }> {
  return api.post(`api/v1/sites/${siteId}/publish`).json<{ status: string; domain: string }>();
}
