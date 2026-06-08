import ky, { HTTPError } from "ky";
import type { SubscriptionStatus, UpgradeResult, MySubscriptionResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth/login";
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/** refresh_token Cookie로 새 access_token 발급 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log("[api] refresh 시도...");
      const res: { access_token: string } = await ky
        .post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          credentials: "include",
          timeout: 10000,
        })
        .json();

      console.log("[api] refresh 성공, 새 토큰 저장");
      setToken(res.access_token);
      return true;
    } catch (e) {
      console.log("[api] refresh 실패:", e);
      clearToken();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** 기본 ky 인스턴스 (refresh 없이) */
const baseApi = ky.create({
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
  },
});

/**
 * 401 자동 refresh 래퍼 함수
 * 모든 API 호출을 이 함수로 감싸서 사용
 */
async function fetchWithRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      // auth 경로 자체의 401은 refresh 안 함
      const url = error.response.url || "";
      console.log("[api] 401 감지, url:", url);
      if (url.includes("/auth/")) {
        throw error;
      }

      // refresh 시도
      const success = await refreshAccessToken();
      if (success) {
        console.log("[api] refresh 후 재시도");
        // 새 토큰으로 재시도
        return await fn();
      } else {
        console.log("[api] refresh 실패 → 로그인 리다이렉트");
        redirectToLogin();
        throw error;
      }
    }
    throw error;
  }
}

/** API 래퍼 - 모든 메서드에 자동 refresh 적용 */
export const api = {
  get: (url: string, options?: object) => ({
    json: <T>() => fetchWithRefresh<T>(() => baseApi.get(url, options).json()),
    text: () => fetchWithRefresh<string>(() => baseApi.get(url, options).text()),
  }),
  post: (url: string, options?: object) => ({
    json: <T>() => fetchWithRefresh<T>(() => baseApi.post(url, options).json()),
    text: () => fetchWithRefresh<string>(() => baseApi.post(url, options).text()),
  }),
  patch: (url: string, options?: object) => ({
    json: <T>() => fetchWithRefresh<T>(() => baseApi.patch(url, options).json()),
    text: () => fetchWithRefresh<string>(() => baseApi.patch(url, options).text()),
  }),
  put: (url: string, options?: object) => ({
    json: <T>() => fetchWithRefresh<T>(() => baseApi.put(url, options).json()),
    text: () => fetchWithRefresh<string>(() => baseApi.put(url, options).text()),
  }),
  delete: (url: string, options?: object) => ({
    json: <T>() => fetchWithRefresh<T>(() => baseApi.delete(url, options).json()),
    text: () => fetchWithRefresh<string>(() => baseApi.delete(url, options).text()),
  }),
};

// --- Subscription API ---

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
  const data = await api.get("api/v1/subscriptions/me").json<MySubscriptionResponse>();
  const { subscription } = data;
  const plan = subscription.plan;

  let sitesUsed = 0;
  try {
    const sites = await api.get("api/v1/sites").json<{ id: string; status: string; is_published?: boolean }[]>();
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
