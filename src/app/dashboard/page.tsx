"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatModal from "@/components/chat/ChatModal";
import PricingModal from "@/components/chat/PricingModal";
import AgreementModal from "@/components/chat/AgreementModal";
import OnboardingDashboard from "@/components/dashboard/OnboardingDashboard";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  getSubscriptionStatus,
  getSites,
  getMonitoringSnapshot,
  getMonitoringHistory,
  getScoreHistory,
  getCitationHistory,
  getPipelineStatus,
  getInfraMetrics,
} from "@/lib/api";
import { getPublishingState, clearPublishingState } from "@/lib/publishing-store";
import PublishingDashboard from "@/components/dashboard/PublishingDashboard";
import { isAuthenticated } from "@/lib/auth-guard";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Ring } from "@/components/dashboard/Ring";
import { cn } from "@/lib/utils";

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardTitle({ children, help }: { children: ReactNode; help?: string }) {
  return (
    <h3 className="mb-3.5 flex items-center gap-1.5 text-sm font-semibold text-gray-500">
      {children}
      {help && (
        <span
          title={help}
          aria-label={`${String(children)} 설명`}
          className="inline-flex h-4 w-4 cursor-default select-none items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        >
          ?
        </span>
      )}
    </h3>
  );
}

function DarkCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-gray-800 bg-gray-900 p-6", className)}>
      {children}
    </div>
  );
}

function DarkCardTitle({ children, help }: { children: ReactNode; help?: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-400">
      {children}
      {help && (
        <span
          title={help}
          aria-label={`${String(children)} 설명`}
          className="inline-flex h-4 w-4 cursor-default select-none items-center justify-center rounded-full bg-gray-700 text-[10px] font-medium text-gray-400 hover:bg-gray-600 hover:text-gray-200"
        >
          ?
        </span>
      )}
    </h3>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-none text-xs font-semibold tracking-wide text-gray-400">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function SlotDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("h-2 w-2 rounded-full", i < filled ? "bg-primary-500" : "bg-gray-200")}
        />
      ))}
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-8 mt-6 flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3">
      <Icon name="triangle-alert" size={16} className="flex-none text-error-600" />
      <p className="flex-1 text-sm text-error-700 [word-break:keep-all]">{message}</p>
      <button onClick={onDismiss} aria-label="닫기" className="flex-none text-error-400 hover:text-error-600">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function CardError() {
  return (
    <div className="flex h-20 items-center gap-2.5 rounded-lg bg-error-50 px-3">
      <Icon name="circle-x" size={15} className="flex-none text-error-400" />
      <p className="text-sm text-error-600 [word-break:keep-all]">
        데이터를 불러오지 못했습니다. 새로고침 해주세요.
      </p>
    </div>
  );
}

function DarkCardError() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-error-900/20 px-3 py-3">
      <Icon name="circle-x" size={14} className="flex-none text-error-400" />
      <p className="text-xs text-error-300 [word-break:keep-all]">데이터를 불러오지 못했습니다</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [siteCreationError, setSiteCreationError] = useState<string | null>(null);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [hasSite, setHasSite] = useState<boolean | null>(null);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "max">("free");
  const [sitesUsed, setSitesUsed] = useState(0);
  const [sitesLimit, setSitesLimit] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingSiteId, setPublishingSiteId] = useState<string | null>(null);
  const [activePublishedAt, setActivePublishedAt] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const loadSites = useCallback(() => {
    getSites()
      .then((sites) => {
        const published = sites.filter((s) => s.is_published);
        setHasSite(published.length > 0);
        const saved = typeof window !== "undefined" ? localStorage.getItem("hezo_active_site") : null;
        const active = published.find((s) => s.id === saved) ?? published[0] ?? null;
        setActiveSiteId(active?.id ?? null);
        setActivePublishedAt(active?.published_at ?? null);
      })
      .catch(() => setHasSite(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const pendingSiteId = getPublishingState();
    if (pendingSiteId) {
      getPipelineStatus(pendingSiteId)
        .then((s) => {
          if (s.pipeline_status === "published") {
            clearPublishingState();
            loadSites();
          } else if (["failed", "generation_failed", "rolled_back"].includes(s.pipeline_status)) {
            clearPublishingState();
            setHasSite(false);
          } else {
            setPublishingSiteId(pendingSiteId);
            setIsPublishing(true);
            setHasSite(false);
          }
        })
        .catch(() => { clearPublishingState(); loadSites(); });
      return;
    }

    loadSites();
    getSubscriptionStatus()
      .then((status) => {
        setUserPlan(status.plan);
        setSitesUsed(status.sites_used);
        setSitesLimit(status.sites_limit);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePublishComplete = useCallback((domainUrl?: string) => {
    clearPublishingState();
    setIsPublishing(false);
    setPublishingSiteId(null);
    void domainUrl;
    loadSites();
  }, [loadSites]);

  const handlePublishError = useCallback(() => {
    clearPublishingState();
    setIsPublishing(false);
    setPublishingSiteId(null);
    setHasSite(false);
  }, []);

  const handleNewSite = useCallback(() => {
    setSiteCreationError(null);
    if (sitesLimit > 0 && sitesUsed >= sitesLimit) {
      setIsPricingOpen(true);
    } else {
      setIsAgreementOpen(true);
    }
  }, [sitesUsed, sitesLimit]);

  useEffect(() => {
    if (hasSite !== null && searchParams.get("chat") === "open") {
      const id = window.setTimeout(handleNewSite, 0);
      return () => window.clearTimeout(id);
    }
  }, [searchParams, hasSite, handleNewSite]);

  const handlePlanSelect = (plan: string) => {
    setIsPricingOpen(false);
    setUserPlan(plan as "free" | "pro" | "max");
    getSubscriptionStatus()
      .then((s) => { setSitesUsed(s.sites_used); setSitesLimit(s.sites_limit); setUserPlan(s.plan); })
      .catch(() => {});
    setIsAgreementOpen(true);
  };

  const handleAgreement = async () => {
    setAgreementLoading(true);
    setSiteCreationError(null);
    try {
      const site: { id: string } = await api
        .post("api/v1/sites", { json: { name: "내 사이트", site_type: "landing", module_key: "medical" } })
        .json();
      setCurrentSiteId(site.id);
      setIsAgreementOpen(false);
      setIsChatOpen(true);
    } catch (err) {
      setIsAgreementOpen(false);
      if (err && typeof err === "object" && "response" in err && (err as { response: Response }).response.status === 403) {
        setIsPricingOpen(true);
      } else {
        setSiteCreationError("사이트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setAgreementLoading(false);
    }
  };

  const { data: snapshot, isLoading: snapLoading, isError: snapError } = useQuery({
    queryKey: ["monitoring-snapshot", activeSiteId],
    queryFn: () => getMonitoringSnapshot(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: history, isError: historyError } = useQuery({
    queryKey: ["monitoring-history", activeSiteId],
    queryFn: () => getMonitoringHistory(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 30,
  });

  const { data: scoreHistory, isError: scoreHistoryError } = useQuery({
    queryKey: ["score-history", activeSiteId],
    queryFn: () => getScoreHistory(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 6,
  });

  const { data: citationHistory, isError: citationError } = useQuery({
    queryKey: ["citation-history", activeSiteId],
    queryFn: () => getCitationHistory(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 6,
  });

  const { data: infraMetrics } = useQuery({
    queryKey: ["infra-metrics", activeSiteId],
    queryFn: () => getInfraMetrics(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  // ── Early returns ────────────────────────────────────────────────────────────

  if (hasSite === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isPublishing && publishingSiteId) {
    return (
      <>
        <TopBar title="대시보드" subtitle="홈페이지 발급이 진행되고 있습니다..." />
        <PublishingDashboard siteId={publishingSiteId} onComplete={handlePublishComplete} onError={handlePublishError} />
      </>
    );
  }

  if (!hasSite) {
    return (
      <>
        <AgreementModal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} onAgree={handleAgreement} loading={agreementLoading} />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
        <OnboardingDashboard onStartChat={handleNewSite} />
      </>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const geo = snapshot ? Object.values(snapshot.geo_files).filter(Boolean).length : 0;
  const jld = snapshot ? Object.values(snapshot.json_ld).filter(Boolean).length : 0;
  const aiScoreFallback = snapshot ? Math.round(((geo / 4) * 50) + ((jld / 3) * 50)) : null;
  const aiScore = scoreHistory?.geo_file_score ?? aiScoreFallback;

  // ── Main dashboard ───────────────────────────────────────────────────────────

  return (
    <>
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} onSelect={handlePlanSelect} currentPlan={userPlan} />
      <AgreementModal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} onAgree={handleAgreement} loading={agreementLoading} />

      <TopBar title="대시보드" subtitle="AI 검색 성과와 사이트 현황을 한눈에 확인하세요.">
        {snapshot?.last_measured_at && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Icon name="clock" size={13} className="text-gray-300" />
            {new Date(snapshot.last_measured_at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <Button hierarchy="primary" onClick={handleNewSite} iconLeading={<Icon name="message-circle" size={18} />}>
          새 사이트 만들기
        </Button>
      </TopBar>

      {siteCreationError && (
        <ErrorBanner message={siteCreationError} onDismiss={() => setSiteCreationError(null)} />
      )}

      <div className="flex flex-col gap-6 p-8">

        {/* ── Hero row: 두 주요 지표 (다크 카드) ─────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* AI 가시성 종합점수 — PRIMARY HERO */}
          <DarkCard>
            <DarkCardTitle help="리포트 에이전트가 주간으로 측정하는 AI 검색 종합 가시성 점수입니다">
              AI 가시성 종합점수
            </DarkCardTitle>
            {scoreHistoryError ? (
              <DarkCardError />
            ) : scoreHistory && scoreHistory.latest_score !== null ? (
              (() => {
                const score = scoreHistory.latest_score!;
                const delta = scoreHistory.latest_delta;
                const trend = scoreHistory.score_history.slice(-7);
                const maxScore = Math.max(...trend.map((p) => p.score), 1);
                return (
                  <div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-[52px] font-bold leading-none tracking-[-0.02em] text-white">
                          {score}
                        </span>
                        <span className="text-xl text-gray-600">/100</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            score >= 80
                              ? "bg-primary-500/20 text-primary-300"
                              : score >= 50
                                ? "bg-warning-500/20 text-warning-300"
                                : "bg-error-500/20 text-error-300",
                          )}
                        >
                          {score >= 80 ? "우수" : score >= 50 ? "보통" : "개선 필요"}
                        </span>
                        {delta !== 0 && (
                          <span className={cn("text-xs font-bold", delta > 0 ? "text-primary-400" : "text-error-400")}>
                            {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}점
                          </span>
                        )}
                      </div>
                    </div>
                    {trend.length > 1 && (
                      <div className="mt-5 flex h-8 items-end gap-1.5">
                        {trend.map((p, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-[2px] bg-primary-500/50"
                            style={{ height: `${Math.round((p.score / maxScore) * 100)}%` }}
                            title={`${p.date}: ${p.score}점`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-[10px] text-gray-600">주간 리포트 에이전트 기준</p>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center gap-2.5 py-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                  <Icon name="trending-up" size={20} className="text-gray-600" />
                </div>
                <p className="text-center text-xs text-gray-500 [word-break:keep-all]">
                  첫 주간 리포트 생성 후<br />점수가 표시됩니다
                </p>
              </div>
            )}
          </DarkCard>

          {/* AI 봇 크롤 감지 — PRIMARY HERO */}
          <DarkCard>
            <DarkCardTitle help="AI 검색 봇이 실제로 사이트를 방문한 횟수입니다. CloudFront 액세스 로그 기반으로 수집합니다.">
              AI 봇 크롤 감지
            </DarkCardTitle>
            {historyError ? (
              <DarkCardError />
            ) : history?.bot_crawls_available ? (
              (() => {
                const bots: { name: string; count: number; color: string }[] = [
                  { name: "GPTBot",        count: history.bot_crawls.gpt_bot,        color: "bg-primary-400" },
                  { name: "ClaudeBot",     count: history.bot_crawls.claude_bot,     color: "bg-blue-400" },
                  { name: "PerplexityBot", count: history.bot_crawls.perplexity_bot, color: "bg-violet-400" },
                  { name: "Naver Yeti",    count: history.bot_crawls.yeti,           color: "bg-green-500" },
                ];
                const maxCount = Math.max(...bots.map((b) => b.count), 1);
                const totalVisits = bots.reduce((s, b) => s + b.count, 0);
                return (
                  <div>
                    <div className="mb-5 flex items-baseline gap-2">
                      <span className="font-display text-[52px] font-bold leading-none tracking-[-0.02em] text-white">
                        {totalVisits.toLocaleString()}
                      </span>
                      <span className="text-xl text-gray-600">회</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {bots.map(({ name, count, color }) => (
                        <div key={name}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-400">{name}</span>
                            <span className="text-xs font-semibold text-gray-300">{count.toLocaleString()}회</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                            <div
                              className={cn("h-full rounded-full transition-all", color)}
                              style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col gap-4 py-4">
                <p className="text-sm text-gray-500 [word-break:keep-all]">
                  CloudFront 로그 활성화 후 AI 봇 방문이 기록됩니다
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["GPTBot", "ClaudeBot", "PerplexityBot", "Yeti"].map((bot) => (
                    <span key={bot} className="rounded-full border border-gray-700 px-2.5 py-0.5 text-[11px] text-gray-500">
                      {bot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DarkCard>
        </div>

        {/* ── Secondary row: 친화도 + 개선항목 ───────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">

          {/* AI 친화도 점수 */}
          <Card onClick={() => router.push("/dashboard/ai-score")}>
            <div className="flex items-start justify-between">
              <CardTitle help="ChatGPT, Claude 등 AI가 사이트를 얼마나 잘 읽을 수 있는지를 100점으로 나타냅니다">
                AI 친화도 점수
              </CardTitle>
              {aiScore !== null && (
                <Badge color={aiScore >= 80 ? "success" : aiScore >= 50 ? "warning" : "error"} size="sm">
                  {aiScore >= 80 ? "우수" : aiScore >= 50 ? "보통" : "개선 필요"}
                </Badge>
              )}
            </div>
            {snapError ? (
              <CardError />
            ) : snapLoading ? (
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ) : snapshot && aiScore !== null ? (
              <div className="flex items-center gap-8">
                <Ring value={aiScore} size={88} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[44px] font-bold leading-none tracking-[-0.02em] text-gray-900">
                      {aiScore}
                    </span>
                    <span className="text-xl text-gray-400">/100</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">GEO 파일</span>
                      <div className="flex items-center gap-2">
                        <SlotDots filled={geo} total={4} />
                        <span className={cn("text-xs font-semibold", geo >= 4 ? "text-success-700" : geo >= 2 ? "text-warning-700" : "text-error-600")}>
                          {geo}/4
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">구조화 데이터</span>
                      <div className="flex items-center gap-2">
                        <SlotDots filled={jld} total={3} />
                        <span className={cn("text-xs font-semibold", jld >= 3 ? "text-success-700" : jld >= 1 ? "text-warning-700" : "text-error-600")}>
                          {jld}/3
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-xs text-gray-400">
                        {snapshot.last_measured_at
                          ? new Date(snapshot.last_measured_at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                          : "방금 전"}
                      </span>
                      <span className="text-xs font-medium text-primary-600">자세히 보기 →</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          {/* AI 추천 개선 항목 */}
          <Card>
            <CardTitle>AI 추천 개선 항목</CardTitle>
            {(() => {
              if (scoreHistory?.action_items.length) {
                const levelStyle: Record<string, string> = {
                  red:    "bg-error-50 text-error-700",
                  yellow: "bg-warning-50 text-warning-700",
                  green:  "bg-success-50 text-success-700",
                };
                const levelLabel: Record<string, string> = { red: "긴급", yellow: "권고", green: "양호" };
                return (
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-gray-400">Claude Haiku 주간 분석</p>
                    {scoreHistory.action_items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={cn("inline-flex h-[22px] min-w-[28px] flex-none items-center justify-center rounded-full text-[10px] font-semibold", levelStyle[item.level])}>
                          {levelLabel[item.level] ?? item.level}
                        </span>
                        <span className="flex-1 text-sm leading-snug text-gray-700 [word-break:keep-all]">{item.text}</span>
                      </div>
                    ))}
                    <Button hierarchy="secondary" size="sm" onClick={() => router.push("/dashboard/ai-score")} className="mt-1 w-full justify-center" iconTrailing={<Icon name="arrow-right" size={15} />}>
                      전체 확인
                    </Button>
                  </div>
                );
              }

              if (snapLoading) return <div className="h-24 animate-pulse rounded-md bg-gray-100" />;
              if (snapError) return <CardError />;
              if (!snapshot) return null;

              const tips: { text: string; badge: string }[] = [];
              if (!snapshot.geo_files.llms_txt)        tips.push({ text: "llms.txt를 추가하면 AI 봇이 사이트를 쉽게 읽을 수 있습니다", badge: "GEO" });
              if (!snapshot.geo_files.llms_full_txt)   tips.push({ text: "llms-full.txt에 FAQ를 추가해 AI 인용률을 높이세요", badge: "GEO" });
              if (!snapshot.json_ld.faq_page)          tips.push({ text: "FAQPage JSON-LD를 추가하면 AI 검색 노출이 향상됩니다", badge: "스키마" });
              if (!snapshot.json_ld.local_business)    tips.push({ text: "LocalBusiness 스키마로 지역 AI 검색을 개선하세요", badge: "스키마" });
              if ((snapshot.ssl_expiry_days ?? 999) < 60)  tips.push({ text: `SSL 인증서 만료 ${snapshot.ssl_expiry_days}일 전 — 갱신을 확인하세요`, badge: "SSL" });
              if ((snapshot.response_ms ?? 0) > 2000)       tips.push({ text: "응답속도가 느립니다. 이미지 최적화를 검토하세요", badge: "성능" });

              if (tips.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                    <Icon name="circle-check-big" size={28} className="text-success-500" />
                    <p className="text-sm font-medium text-gray-700">모든 항목이 우수합니다</p>
                    <p className="text-xs text-gray-400">주간 리포트에서 상세 분석을 확인하세요</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  {tips.slice(0, 3).map((tip) => (
                    <div key={tip.text} className="flex items-start gap-3">
                      <span className="inline-flex h-[22px] min-w-[28px] flex-none items-center justify-center rounded-full bg-warning-50 text-[10px] font-semibold text-warning-700">
                        {tip.badge.slice(0, 3)}
                      </span>
                      <span className="flex-1 text-sm leading-snug text-gray-700 [word-break:keep-all]">{tip.text}</span>
                    </div>
                  ))}
                  <Button hierarchy="secondary" size="sm" onClick={() => router.push("/dashboard/ai-score")} className="mt-1 w-full justify-center" iconTrailing={<Icon name="arrow-right" size={15} />}>
                    전체 확인
                  </Button>
                </div>
              );
            })()}
          </Card>
        </div>

        {/* ── 사이트 건강 섹션 ──────────────────────────────────────────── */}
        <SectionDivider label="사이트 건강" />

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">

          {/* 사이트 상태 (응답속도 추이 통합) */}
          <Card>
            <CardTitle>사이트 상태</CardTitle>
            {snapError ? (
              <CardError />
            ) : snapLoading ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot ? (
              <div className="flex flex-col gap-2">
                {(
                  [
                    ["응답속도", snapshot.response_ms ? `${snapshot.response_ms}ms` : "측정 중", snapshot.response_ms !== null && snapshot.response_ms < 1000],
                    ["SSL 인증서", snapshot.ssl_expiry_days !== null ? `${snapshot.ssl_expiry_days}일` : "확인 중", (snapshot.ssl_expiry_days ?? 0) > 30],
                    ["llms.txt",      snapshot.geo_files.llms_txt      ? "정상" : "없음", snapshot.geo_files.llms_txt],
                    ["llms-full.txt", snapshot.geo_files.llms_full_txt ? "정상" : "없음", snapshot.geo_files.llms_full_txt],
                  ] as [string, string, boolean][]
                ).map(([k, v, ok]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="min-w-0 truncate text-xs text-gray-600">{k}</span>
                    <div className="flex flex-none items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-800">{v}</span>
                      <span className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full", ok ? "bg-success-50" : "bg-error-50")}>
                        <Icon name={ok ? "check" : "x"} size={10} className={ok ? "text-success-600" : "text-error-500"} />
                      </span>
                    </div>
                  </div>
                ))}
                {history?.response_ms_history.some((p) => p.value !== null) && (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <p className="mb-1 text-[10px] text-gray-400">응답속도 7일</p>
                    <div className="flex h-7 items-end gap-1">
                      {history.response_ms_history.slice(-7).map((p, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-[2px] bg-primary-100"
                          style={{ height: `${p.value ? Math.min(100, Math.round((p.value / 2000) * 100)) : 4}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </Card>

          {/* PageSpeed */}
          <Card>
            <CardTitle>PageSpeed</CardTitle>
            {snapError ? (
              <CardError />
            ) : snapLoading ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot && (snapshot.pagespeed_mobile !== null || snapshot.pagespeed_desktop !== null) ? (
              <div className="flex flex-col gap-3.5">
                {(
                  [
                    ["모바일", snapshot.pagespeed_mobile],
                    ["데스크탑", snapshot.pagespeed_desktop],
                  ] as [string, number | null][]
                ).map(([label, score]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600">{label}</span>
                      {score !== null ? (
                        <span className={cn("text-xs font-bold", score >= 90 ? "text-success-700" : score >= 50 ? "text-warning-700" : "text-error-600")}>
                          {score}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">측정 중</span>
                      )}
                    </div>
                    {score !== null && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn("h-full rounded-full", score >= 90 ? "bg-success-500" : score >= 50 ? "bg-warning-400" : "bg-error-400")}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-[10px] text-gray-400">Google PageSpeed Insights</p>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
                <p className="text-xs text-gray-400">{snapshot ? "API 키 미설정" : "측정 중..."}</p>
              </div>
            )}
          </Card>

          {/* Google 인덱싱 */}
          <Card>
            <CardTitle help="발행일 기준 Google 검색엔진 등록 여부를 추정합니다">
              인덱싱 상태
            </CardTitle>
            {(() => {
              const publishedAt = activePublishedAt ? new Date(activePublishedAt) : null;
              if (!publishedAt) {
                return (
                  <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
                    <p className="text-xs text-gray-400">발행 정보 없음</p>
                  </div>
                );
              }
              const daysElapsed = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
              const status =
                daysElapsed >= 14
                  ? { label: "인덱싱됨 (추정)", dot: "bg-success-500", text: "text-success-700" }
                  : daysElapsed >= 7
                    ? { label: "인덱싱 중 (추정)", dot: "bg-warning-400", text: "text-warning-700" }
                    : { label: "인덱싱 시작 전", dot: "bg-gray-300", text: "text-gray-500" };
              const steps = [
                { label: "발행", done: true, sub: "D+0" },
                { label: "봇 방문", done: daysElapsed >= 2, sub: "D+2~" },
                { label: "인덱싱", done: daysElapsed >= 14, sub: "D+14~" },
              ];
              return (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                      <span className={cn("text-xs font-semibold", status.text)}>{status.label}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      D+{daysElapsed} ({publishedAt.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} 발행)
                    </p>
                  </div>
                  <div className="flex items-center">
                    {steps.map((step, i) => (
                      <div key={step.label} className="flex flex-1 items-center">
                        <div className="flex min-w-0 flex-col items-center">
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", step.done ? "bg-success-500 text-white" : "bg-gray-100 text-gray-400")}>
                            {step.done ? <Icon name="check" size={10} /> : i + 1}
                          </div>
                          <p className={cn("mt-0.5 text-center text-[9px] font-medium leading-tight", step.done ? "text-success-700" : "text-gray-400")}>
                            {step.label}
                          </p>
                          <p className="text-[8px] text-gray-400">{step.sub}</p>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={cn("mx-1 h-0.5 flex-1", step.done && steps[i + 1].done ? "bg-success-200" : "bg-gray-100")} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* LLM 인용 현황 */}
          <Card>
            <CardTitle help="AI가 업종 관련 질문에 답할 때 내 사이트를 인용하는 비율입니다">
              LLM 인용
            </CardTitle>
            {citationError ? (
              <CardError />
            ) : citationHistory?.latest ? (
              (() => {
                const latest = citationHistory.latest!;
                const llms: { key: keyof typeof latest; label: string; color: string }[] = [
                  { key: "chatgpt",    label: "ChatGPT",    color: "bg-success-400" },
                  { key: "claude",     label: "Claude",     color: "bg-primary-400" },
                  { key: "perplexity", label: "Perplexity", color: "bg-violet-400" },
                  { key: "naver",      label: "Naver",      color: "bg-green-500" },
                ];
                return (
                  <div className="flex flex-col gap-2.5">
                    {llms.map(({ key, label, color }) => {
                      const rate = latest[key];
                      if (rate === null) return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{label}</span>
                          <span className="text-[10px] text-gray-300">-</span>
                        </div>
                      );
                      const pct = Math.round(rate * 100);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-16 flex-none truncate text-xs text-gray-600">{label}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-7 flex-none text-right text-xs font-bold text-gray-700">{pct}%</span>
                        </div>
                      );
                    })}
                    <p className="mt-1 text-[10px] text-gray-400">{citationHistory.query_count}개 질의 기준</p>
                  </div>
                );
              })()
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="select-none opacity-20 blur-[3px]" aria-hidden="true">
                  <div className="flex flex-col gap-2.5">
                    {["ChatGPT", "Claude", "Perplexity", "Naver"].map((e) => (
                      <div key={e} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-gray-700">{e}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-gray-300" />
                        <span className="w-7 text-right text-xs font-bold text-gray-700">--</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <Icon name="trending-up" size={18} className="text-gray-300" />
                  <p className="text-center text-[10px] text-gray-400 [word-break:keep-all]">리포트 실행 후<br />표시됩니다</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── 인프라 모니터링 ──────────────────────────────────────────────── */}
        {infraMetrics?.available && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">인프라 모니터링</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "CPU",
                  value: infraMetrics.cpu_percent,
                  unit: "%",
                  warn: 80,
                  danger: 90,
                },
                {
                  label: "메모리",
                  value: infraMetrics.memory_percent,
                  unit: "%",
                  warn: 80,
                  danger: 90,
                },
                {
                  label: "디스크",
                  value: infraMetrics.disk_percent,
                  unit: "%",
                  warn: 70,
                  danger: 85,
                },
                {
                  label: "네트워크 수신",
                  value: infraMetrics.net_rx_kbps,
                  unit: " kbps",
                  warn: Infinity,
                  danger: Infinity,
                },
              ].map(({ label, value, unit, warn, danger }) => {
                const color =
                  value === null ? "text-gray-400"
                  : value >= danger ? "text-error-600"
                  : value >= warn ? "text-warning-600"
                  : "text-success-700";
                return (
                  <Card key={label} className="flex flex-col gap-1 py-4">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className={`text-2xl font-bold tabular-nums ${color}`}>
                      {value !== null ? `${value}${unit}` : "—"}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
