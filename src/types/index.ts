// HEZO Studio 공통 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  oauthProvider: "email" | "kakao" | "naver";
}

// 백엔드 GET /api/v1/users/me 응답 타입
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  email_verified_at: string | null;
  email_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
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
  plan: "free" | "pro" | "max";
  plan_code: string;
  plan_name: string;
  sites_used: number;
  sites_limit: number;
  can_upgrade: boolean;
  can_publish: boolean;
  next_plan: string | null;
  plan_updated_at: string | null;
}

// 플랜 업그레이드 결과 (구버전 응답 형태 — 현재는 MySubscriptionResponse 사용)
export interface UpgradeResult {
  success: boolean;
  plan: string;
  sites_limit: number;
  message: string;
}

// 소셜 로그인 응답 (POST /api/v1/auth/oauth/{provider} | complete-signup)
export interface OAuthLoginResponse {
  signup_required: boolean;
  access_token: string | null;
  token_type: string;
  signup_token: string | null;
  provider: string | null;
  suggested_email: string | null;
  suggested_name: string | null;
}

// 결제 요청 생성 응답 (POST /api/v1/billing/checkout)
export interface BillingCheckoutResponse {
  payment_request_id: string;
  provider: string;
  plan_code: string;
  amount: number;
  currency: string;
  status: string;
  payment_params: Record<string, unknown>;
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

export interface GeoFiles {
  llms_txt: boolean;
  llms_full_txt: boolean;
  sitemap_xml: boolean;
  robots_txt: boolean;
}

export interface JsonLd {
  local_business: boolean;
  faq_page: boolean;
  service: boolean;
}

export interface LlmsFullQuality {
  faq_count: number;
  char_count: number;
  has_core_services: boolean;
  has_faq: boolean;
  has_core_pages: boolean;
}

export interface MonitoringSnapshot {
  geo_files: GeoFiles;
  json_ld: JsonLd;
  ssl_expiry_days: number | null;
  response_ms: number | null;
  pagespeed_mobile: number | null;
  pagespeed_desktop: number | null;
  llms_full_quality: LlmsFullQuality | null;
  last_measured_at: string;
  from_cache: boolean;
}

export interface ResponseMsPoint {
  date: string;
  value: number | null;
}

export interface BotCrawls {
  gpt_bot: number;
  claude_bot: number;
  perplexity_bot: number;
  yeti: number;
}

export interface MonitoringHistory {
  response_ms_history: ResponseMsPoint[];
  bot_crawls: BotCrawls;
  bot_crawls_available: boolean;
}

export interface ScorePoint {
  date: string;
  score: number;
  delta: number;
}

export interface ActionItem {
  level: "red" | "yellow" | "green";
  text: string;
}

export interface ScoreHistory {
  score_history: ScorePoint[];
  latest_score: number | null;
  latest_delta: number;
  action_items: ActionItem[];
  geo_file_score: number | null;  // 리포트 에이전트 GEO 품질 점수 (10개 체크, 주 1회)
}

export interface LlmCitationRates {
  claude: number | null;
  chatgpt: number | null;
  perplexity: number | null;
  naver: number | null;
}

export interface CitationPoint {
  date: string;
  rates: LlmCitationRates;
}

export interface CitationHistory {
  citation_history: CitationPoint[];
  latest: LlmCitationRates | null;
  query_count: number;
}

export interface InfraMetrics {
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  net_rx_kbps: number | null;
  net_tx_kbps: number | null;
  available: boolean;
}
