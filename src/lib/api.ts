import ky, { isHTTPError, type BeforeErrorHook } from "ky";
import type {
  SubscriptionStatus,
  MySubscriptionResponse,
  UserResponse,
  OAuthLoginResponse,
  BillingCheckoutResponse,
} from "@/types";

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

/** ky HTTPError에서 백엔드 에러 메시지를 추출 (없으면 fallback). */
export async function getApiErrorMessage(
  err: unknown,
  fallback = "요청에 실패했습니다",
): Promise<string> {
  if (err && typeof err === "object" && "response" in err) {
    try {
      const body = await (err as { response: Response }).response.json();
      return body?.error?.message ?? body?.message ?? body?.detail ?? fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

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
function mapPlanCode(code: string): "free" | "pro" | "max" {
  const map: Record<string, "free" | "pro" | "max"> = {
    FREE: "free",
    PRO: "pro",
    MAX: "max",
  };
  return map[code] || "free";
}

function getNextPlan(code: string): string | null {
  const map: Record<string, string | null> = {
    FREE: "PRO",
    PRO: "MAX",
    MAX: null,
  };
  return map[code] ?? null;
}

// 프론트 plan 키("free"|"pro"|"max") → 백엔드 plan_code
function toPlanCode(planKey: string): string {
  const map: Record<string, string> = {
    free: "FREE",
    pro: "PRO",
    max: "MAX",
  };
  return map[planKey.toLowerCase()] ?? planKey.toUpperCase();
}

// --- Sites API ---

export interface SiteSummary {
  id: string;
  name: string;
  site_type: string;
  module_key: string;
  status: string;
  is_published: boolean;
  published_at: string | null;
}

/** POST /api/v1/sites — 새 사이트 생성 */
export async function createSite(name: string, siteType = "landing"): Promise<SiteSummary> {
  return api.post("api/v1/sites", { json: { name, site_type: siteType } }).json<SiteSummary>();
}

/** GET /api/v1/sites — 백엔드는 { items, total } 형태로 응답한다. */
export async function getSites(): Promise<SiteSummary[]> {
  const res = await api
    .get("api/v1/sites")
    .json<{ items: SiteSummary[]; total: number }>();
  return res.items ?? [];
}

// --- Users API ---

/** GET /api/v1/users/me — 현재 로그인 사용자 프로필 */
export async function getCurrentUser(): Promise<UserResponse> {
  return api.get("api/v1/users/me").json<UserResponse>();
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  // 백엔드 팀 API: GET /api/v1/subscriptions/me
  const data = await api.get("api/v1/subscriptions/me").json<MySubscriptionResponse>();
  const { subscription } = data;
  const plan = subscription.plan;

  // 사이트 수 조회 (published 기준)
  let sitesUsed = 0;
  try {
    const sites = await getSites();
    sitesUsed = sites.filter((s) => s.is_published).length;
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

/**
 * 플랜 업그레이드 (개발 환경 전용 즉시 반영).
 * POST /api/v1/dev/subscriptions/upgrade — APP_ENV ∈ {local,dev,test} + 이메일 인증 필요.
 * targetPlan 은 프론트 키("pro"|"max") 또는 plan_code("PRO"|"MAX") 둘 다 허용.
 */
export async function upgradePlan(targetPlan: string): Promise<MySubscriptionResponse> {
  return api
    .post("api/v1/dev/subscriptions/upgrade", { json: { plan_code: toPlanCode(targetPlan) } })
    .json<MySubscriptionResponse>();
}

/** POST /api/v1/billing/checkout — 실결제(Toss) 요청 생성. plan_code 기준. */
export async function createCheckout(planKeyOrCode: string): Promise<BillingCheckoutResponse> {
  return api
    .post("api/v1/billing/checkout", { json: { plan_code: toPlanCode(planKeyOrCode) } })
    .json<BillingCheckoutResponse>();
}

export interface BillingConfirmResponse {
  payment_request_id: string;
  plan_code: string;
  amount: number;
  status: string;
}

/** POST /api/v1/billing/confirm — Toss 결제 승인 + 플랜 업그레이드. */
export async function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<BillingConfirmResponse> {
  return api.post("api/v1/billing/confirm", { json: params }).json<BillingConfirmResponse>();
}

// --- Profile / Account API ---

/** PATCH /api/v1/users/me — 이름/전화번호 수정 (둘 다 선택). */
export async function updateProfile(data: { name?: string; phone?: string | null }): Promise<UserResponse> {
  return api.patch("api/v1/users/me", { json: data }).json<UserResponse>();
}

/** DELETE /api/v1/auth/me — 회원 탈퇴(계정 영구 삭제). */
export async function deleteAccount(): Promise<void> {
  await api.delete("api/v1/auth/me");
}

/** PATCH /api/v1/auth/me/password — 비밀번호 변경. */
export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await api.patch("api/v1/auth/me/password", { json: data });
}

/** POST /api/v1/auth/logout — refresh 토큰 무효화(쿠키 기반, best-effort). */
export async function logoutApi(): Promise<void> {
  try {
    await api.post("api/v1/auth/logout");
  } catch {
    // 서버 로그아웃 실패해도 로컬 토큰은 제거하므로 무시
  }
}

// --- OAuth API ---

export type OAuthProvider = "kakao" | "naver";

/** POST /api/v1/auth/oauth/{provider} — 인가코드 교환 로그인. */
export async function oauthLogin(
  provider: OAuthProvider,
  params: { code: string; redirect_uri: string },
): Promise<OAuthLoginResponse> {
  return api.post(`api/v1/auth/oauth/${provider}`, { json: params }).json<OAuthLoginResponse>();
}

/** POST /api/v1/auth/oauth/complete-signup — 신규 소셜 사용자 가입 완료. */
export async function completeOAuthSignup(data: {
  signup_token: string;
  email: string;
  name: string;
}): Promise<OAuthLoginResponse> {
  return api.post("api/v1/auth/oauth/complete-signup", { json: data }).json<OAuthLoginResponse>();
}

// --- Sites publish & pipeline ---

export interface PublishResponse {
  site_id: string;
  mode: "aws_pipeline" | "local";
  pipeline_status: string;
  execution_arn?: string;
  message: string;
}

export interface PipelineStatusResponse {
  site_id: string;
  pipeline_status:
    | "running"
    | "generation_complete"
    | "generation_failed"
    | "failed"
    | "rolled_back"
    | "published"
    | "unknown";
  render_spec_s3_key?: string;
  execution_arn?: string;
  updated_at?: string;
  error?: string;
}

export async function publishSite(siteId: string): Promise<PublishResponse> {
  return api.post(`api/v1/sites/${siteId}/publish`).json<PublishResponse>();
}

export async function getPipelineStatus(siteId: string): Promise<PipelineStatusResponse> {
  return api.get(`api/v1/sites/${siteId}/pipeline/status`).json<PipelineStatusResponse>();
}

// --- Contract JSON ---

export interface ContractContact {
  phone: string;
  email?: string;
  address: string;
  hours: { weekday: string; lunch_break?: string; saturday?: string; sunday?: string };
  kakao?: string;
}

export interface ContractDomainData {
  hero: { headline: string; subheadline: string; cta_text: string };
  values: { title: string; desc: string }[];
  services: { name: string; desc: string }[];
  reviews: { text: string; author: string; info: string }[];
  faq: { q: string; a: string }[];
}

export interface ContractJson {
  template?: { category?: string; template_id?: string; slug?: string };
  brand: { name: string; tone?: string; primary_color?: string };
  seo?: { title_keyword?: string; target_region?: string };
  contact: ContractContact;
  content: {
    landing?: { domain_data: ContractDomainData };
  };
  governance?: { preview_ready?: boolean };
}

/** GET /api/v1/sites/{siteId}/contract — Contract JSON 조회 */
export async function getContractJson(siteId: string): Promise<ContractJson> {
  return api.get(`api/v1/sites/${siteId}/contract`).json<ContractJson>();
}

// --- Chat API ---

export interface ChatRequest {
  session_id: string;
  user_message: string;
  answered_slot?: string;
  known_answers?: Record<string, unknown>;
  domain?: string;
  domain_label?: string;
  category?: string;
  template_id?: string;
}

export interface ChatResponse {
  session_id: string;
  assistant_message: string;
  turn_status: "answer_accepted" | "answer_rejected" | "ready_for_contract_compile";
  next_stage: "proactive_questioning" | "contract_compile" | "retry_answer";
  slot_filled?: Record<string, unknown>;
  missing_slots?: string[];
  current_slot?: string;
  mock?: boolean;
}

export async function sendChatMessage(siteId: string, payload: ChatRequest): Promise<ChatResponse> {
  return api.post(`api/v1/sites/${siteId}/chat`, { json: payload, timeout: 150000 }).json<ChatResponse>();
}

// --- Preview API ---

export interface PreviewResponse {
  site_id: string;
  preview_mode: "triggered" | "mock";
  preview_url?: string;
  message: string;
}

export async function triggerPreview(siteId: string): Promise<PreviewResponse> {
  return api.post(`api/v1/sites/${siteId}/preview`).json<PreviewResponse>();
}
