// HEZO Studio 공통 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  oauthProvider: "email" | "kakao" | "naver";
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
