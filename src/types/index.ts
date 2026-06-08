// HEZO Studio 공통 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  oauthProvider: "email" | "kakao" | "naver";
}

// 백엔드 GET /api/v1/auth/me 응답 타입 (플랜 정보 포함)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  oauth_provider: "email" | "kakao" | "naver";
  plan: "starter" | "pro" | "enterprise";
  sites_count: number;
  sites_limit: number;
  can_upgrade: boolean;
}

// 구독 플랜 상태 (GET /api/v1/subscriptions/me 응답)
export interface PlanInfo {
  id: string;
  code: string;       // "FREE" | "PRO" | "MAX"
  name: string;
  price_monthly: number;
  currency: string;
  max_sites: number;
  can_publish: boolean;
}

export interface SubscriptionInfo {
  id: string;
  status: string;     // "active" | "trialing" | "past_due" | "canceled" | "expired"
  started_at: string;
  ended_at: string | null;
  renewed_at: string | null;
  plan: PlanInfo;
}

export interface MySubscriptionResponse {
  subscription: SubscriptionInfo;
}

// 프론트에서 사용하는 통합 구독 상태 (API 응답을 가공한 것)
export interface SubscriptionStatus {
  plan: "starter" | "pro" | "enterprise";
  plan_code: string;
  plan_name: string;
  sites_used: number;
  sites_limit: number;
  can_upgrade: boolean;
  can_publish: boolean;
  next_plan: string | null;
  plan_updated_at: string | null;
}

// 플랜 업그레이드 결과 (POST /api/v1/subscription/upgrade 응답)
export interface UpgradeResult {
  success: boolean;
  plan: string;
  sites_limit: number;
  message: string;
}

// 플랜 관련 에러 응답 (403)
export interface PlanError {
  error: "upgrade_required" | "limit_exceeded" | "invalid_plan";
  current_count: number;
  max_limit: number;
  message: string;
}

// 챗봇 세션 상태 (프론트엔드 상태 관리용)
export interface ChatSession {
  sessionId: string;
  startedAt: number | null;
  remainingSeconds: number;
  isExpired: boolean;
  regenerationCount: number;
  maxRegenerations: 2;
}

export interface Site {
  id: string;
  name: string;
  jobModule: "medical" | "blog" | "restaurant";
  siteStructure: "landing" | "blog" | "store";
  domain: string | null;
  status: "draft" | "published" | "suspended";
  publishedAt: string | null;
  createdAt: string;
}

export interface MetricEvaluation {
  tier1Score: {
    total: number;
    breakdown: Record<string, number>;
    suggestions: string[];
    displayType: "checklist";
  };
  tier2Score: {
    relativeScore: number;
    competitorsAnalyzed: number;
    competitorsTotal: number;
    baselineAvg: Record<string, number>;
    baselineMax: Record<string, number>;
    fallbackToTier1: boolean;
    noComparisonData: boolean;
    displayType: "primary_metric";
  };
  tier3Score: {
    total: number;
    breakdown: Record<string, number>;
    trendData: { date: string; score: number }[];
    displayType: "trend_graph";
  };
  criteriaVersion: string;
  evaluatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: {
    researchInProgress?: boolean;
    suggestedQuestions?: string[];
  };
}

export interface ContractJSON {
  siteId: string;
  jobModule: string;
  siteStructure: string;
  pages: { slug: string; sections: unknown[] }[];
  entities: Record<string, unknown>;
  seo: Record<string, unknown>;
  contentEnrichment: Record<string, unknown>;
  improvementSuggestions: string[];
}

export interface Template {
  id: string;
  name: string;
  jobModule: string;
  siteStructure: string;
  thumbnailUrl: string;
  description: string;
}

export interface ProvisioningStatus {
  provisioningId: string;
  status: "pending" | "provisioning" | "ready" | "failed";
  customerInfra: {
    instanceId: string;
    dbEndpoint: string;
    s3Bucket: string;
    domain: string;
  } | null;
  error: { message: string; retryCount: number } | null;
}
