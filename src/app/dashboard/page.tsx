"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatModal from "@/components/chat/ChatModal";
import PricingModal from "@/components/chat/PricingModal";
import AgreementModal from "@/components/chat/AgreementModal";
import OnboardingDashboard from "@/components/dashboard/OnboardingDashboard";
import { useQuery } from "@tanstack/react-query";
import { api, getSubscriptionStatus, getSites, getMonitoringSnapshot, getMonitoringHistory, getPipelineStatus } from "@/lib/api";
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

function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3.5 text-sm font-semibold text-gray-500">{children}</h3>;
}

function MiniBars({ data, color }: { data: number[]; color: string }) {
  return (
    <div className="mt-4 flex h-14 items-end gap-1.5">
      {data.map((h, i) => (
        <div
          key={i}
          className={cn("flex-1 rounded-t-[3px]", color)}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50";

export default function DashboardPage() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [hasSite, setHasSite] = useState<boolean | null>(null); // null = loading
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "max">("free");
  const [sitesUsed, setSitesUsed] = useState(0);
  const [sitesLimit, setSitesLimit] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingSiteId, setPublishingSiteId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const loadSites = useCallback(() => {
    getSites()
      .then((sites) => {
        const published = sites.filter((s) => s.is_published);
        setHasSite(published.length > 0);
        const saved =
          typeof window !== "undefined"
            ? localStorage.getItem("hezo_active_site")
            : null;
        setActiveSiteId(
          published.find((s) => s.id === saved)?.id ?? published[0]?.id ?? null,
        );
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
          } else if (
            s.pipeline_status === "failed" ||
            s.pipeline_status === "generation_failed" ||
            s.pipeline_status === "rolled_back"
          ) {
            clearPublishingState();
            setHasSite(false);
          } else {
            setPublishingSiteId(pendingSiteId);
            setIsPublishing(true);
            setHasSite(false);
          }
        })
        .catch(() => {
          clearPublishingState();
          loadSites();
        });
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

  const handlePublishComplete = useCallback(
    (domainUrl?: string) => {
      clearPublishingState();
      setIsPublishing(false);
      setPublishingSiteId(null);
      void domainUrl;
      loadSites();
    },
    [loadSites],
  );

  const handlePublishError = useCallback(() => {
    clearPublishingState();
    setIsPublishing(false);
    setPublishingSiteId(null);
    setHasSite(false);
  }, []);

  const handleNewSite = useCallback(() => {
    // 한도 내면 챗봇 진입(무료도 챗봇/프리뷰 가능), 한도 초과면 업그레이드 안내
    if (sitesLimit > 0 && sitesUsed >= sitesLimit) {
      setIsPricingOpen(true);
    } else {
      setIsAgreementOpen(true);
    }
  }, [sitesUsed, sitesLimit]);

  useEffect(() => {
    if (hasSite !== null && searchParams.get("chat") === "open") {
      const timeoutId = window.setTimeout(handleNewSite, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, hasSite, handleNewSite]);

  const handlePlanSelect = (plan: string) => {
    setIsPricingOpen(false);
    setUserPlan(plan as "free" | "pro" | "max");
    getSubscriptionStatus()
      .then((status) => {
        setSitesUsed(status.sites_used);
        setSitesLimit(status.sites_limit);
        setUserPlan(status.plan);
      })
      .catch(() => {});
    setIsAgreementOpen(true);
  };

  const handleAgreement = async () => {
    setAgreementLoading(true);
    try {
      const site: { id: string } = await api
        .post("api/v1/sites", { json: { name: "내 사이트", site_type: "landing", module_key: "medical" } })
        .json();
      setCurrentSiteId(site.id);
      setIsAgreementOpen(false);
      setIsChatOpen(true);
    } catch (err) {
      console.error("Failed to create site:", err);
      setIsAgreementOpen(false);
      // 플랜 한도 초과(403) → 업그레이드 안내
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response: Response }).response.status === 403
      ) {
        setIsPricingOpen(true);
      } else {
        alert("사이트 생성에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setAgreementLoading(false);
    }
  };

  const { data: snapshot, isLoading: snapLoading } = useQuery({
    queryKey: ["monitoring-snapshot", activeSiteId],
    queryFn: () => getMonitoringSnapshot(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: history } = useQuery({
    queryKey: ["monitoring-history", activeSiteId],
    queryFn: () => getMonitoringHistory(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 30,
  });

  // 로딩 상태
  if (hasSite === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // 발급 진행 중 → PublishingDashboard
  if (isPublishing && publishingSiteId) {
    return (
      <>
        <TopBar
          title="대시보드"
          subtitle="홈페이지 발급이 진행되고 있습니다..."
        />
        <PublishingDashboard
          siteId={publishingSiteId}
          onComplete={handlePublishComplete}
          onError={handlePublishError}
        />
      </>
    );
  }

  // 사이트 미발급 → 온보딩 대시보드
  if (!hasSite) {
    return (
      <>
        <AgreementModal
          isOpen={isAgreementOpen}
          onClose={() => setIsAgreementOpen(false)}
          onAgree={handleAgreement}
          loading={agreementLoading}
        />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
        <OnboardingDashboard onStartChat={handleNewSite} />
      </>
    );
  }

  // 사이트 발급됨 → 데이터 대시보드 (수치는 디자인 목업 — 전용 API 연동 시 교체)
  return (
    <>
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelect={handlePlanSelect}
        currentPlan={userPlan}
      />
      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAgree={handleAgreement}
        loading={agreementLoading}
      />

      <TopBar title="대시보드" subtitle="AI 검색 성과와 사이트 현황을 한눈에 확인하세요.">
        {snapshot?.last_measured_at && (
          <span className={cn(ghostBtn, "cursor-default text-xs text-gray-400")}>
            <Icon name="clock" size={14} className="text-gray-400" />
            마지막 측정: {new Date(snapshot.last_measured_at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <Button
          hierarchy="primary"
          onClick={handleNewSite}
          iconLeading={<Icon name="message-circle" size={18} />}
        >
          새 사이트 만들기
        </Button>
      </TopBar>

      <div className="flex flex-col gap-6 p-8">
        {/* Row 1 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card onClick={() => router.push("/dashboard/ai-score")}>
            <CardTitle>AI 친화도 점수</CardTitle>
            {snapLoading ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot ? (() => {
              const geo = Object.values(snapshot.geo_files).filter(Boolean).length;
              const jld = Object.values(snapshot.json_ld).filter(Boolean).length;
              const score = Math.round(((geo / 4) * 50) + ((jld / 3) * 50));
              return (
                <div className="flex items-center gap-[18px]">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-[40px] font-bold tracking-[-0.02em] text-gray-900">{score}</span>
                      <span className="text-lg text-gray-400">/100</span>
                    </div>
                    <div className="mt-1.5">
                      <Badge color={score >= 80 ? "success" : score >= 50 ? "warning" : "error"} size="sm">
                        {score >= 80 ? "우수" : score >= 50 ? "보통" : "개선 필요"}
                      </Badge>
                    </div>
                    <div className="mb-0.5 mt-3 text-xs text-gray-400">
                      마지막 측정: {snapshot.from_cache ? "캐시" : "방금 전"}
                    </div>
                  </div>
                  <Ring value={score} size={84} />
                </div>
              );
            })() : null}
          </Card>

          <Card>
            <CardTitle>LLM 인용 메트릭스</CardTitle>
            <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
              <p className="text-sm text-gray-400">v1.1 출시 예정 — 준비 중</p>
            </div>
          </Card>

          <Card>
            <CardTitle>AI 봇 크롤 감지</CardTitle>
            {history?.bot_crawls_available ? (
              <div className="flex flex-col gap-2.5">
                {[
                  ["GPTBot", history.bot_crawls.gpt_bot],
                  ["ClaudeBot", history.bot_crawls.claude_bot],
                  ["PerplexityBot", history.bot_crawls.perplexity_bot],
                  ["Naver Yeti", history.bot_crawls.yeti],
                ].map(([name, count]) => (
                  <div key={String(name)} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{String(name)}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}회</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
                <p className="text-center text-xs text-gray-400">
                  CloudFront 로그 활성화 후<br />수집됩니다
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardTitle>사이트 상태</CardTitle>
            {snapLoading ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot ? (
              <div className="flex flex-col gap-3.5">
                {([
                  ["응답 속도", snapshot.response_ms ? `${snapshot.response_ms}ms` : "측정 중", snapshot.response_ms !== null && snapshot.response_ms < 1000],
                  ["SSL 인증서", snapshot.ssl_expiry_days !== null ? `${snapshot.ssl_expiry_days}일 남음` : "확인 중", (snapshot.ssl_expiry_days ?? 0) > 30],
                  ["llms.txt", snapshot.geo_files.llms_txt ? "정상" : "없음", snapshot.geo_files.llms_txt],
                  ["llms-full.txt", snapshot.geo_files.llms_full_txt ? "정상" : "없음", snapshot.geo_files.llms_full_txt],
                ] as [string, string, boolean][]).map(([k, v, ok]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{k}</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{v}</span>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${ok ? "bg-success-50" : "bg-error-50"}`}>
                        <Icon name={ok ? "check" : "x"} size={13} className={ok ? "text-success-600" : "text-error-600"} />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <Card>
            <CardTitle>응답속도 7일 추이</CardTitle>
            {history?.response_ms_history.some((p) => p.value !== null) ? (
              <>
                <div className="text-xs text-gray-400">최근 측정</div>
                <div className="font-display text-[32px] font-bold tracking-[-0.02em] text-gray-900">
                  {history.response_ms_history.filter((p) => p.value !== null).at(-1)?.value}
                  <span className="text-[17px] text-gray-400">ms</span>
                </div>
                <MiniBars
                  data={history.response_ms_history.map((p) =>
                    p.value ? Math.min(100, Math.round((p.value / 2000) * 100)) : 0
                  )}
                  color="bg-primary-100"
                />
              </>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
                <p className="text-xs text-gray-400">첫 측정 후 그래프가 표시됩니다</p>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>PageSpeed 점수</CardTitle>
            {snapLoading ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot && (snapshot.pagespeed_mobile !== null || snapshot.pagespeed_desktop !== null) ? (
              <div className="flex flex-col gap-3.5">
                {([
                  ["모바일", snapshot.pagespeed_mobile],
                  ["데스크탑", snapshot.pagespeed_desktop],
                ] as [string, number | null][]).map(([label, score]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    {score !== null ? (
                      <span className={cn(
                        "text-sm font-semibold",
                        score >= 90 ? "text-success-600" : score >= 50 ? "text-warning-600" : "text-error-600",
                      )}>
                        {score}점
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">측정 중</span>
                    )}
                  </div>
                ))}
                <div className="mt-1 text-xs text-gray-400">
                  Google PageSpeed Insights 기준
                </div>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md bg-gray-50">
                <p className="text-xs text-gray-400">
                  {snapshot ? "PageSpeed API 키 미설정" : "사이트 측정 중..."}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* LLM 인용 현황 — v1.1 준비 중 */}
          <Card>
            <CardTitle>LLM 인용 현황</CardTitle>
            <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5">
              {/* 블러 미리보기 */}
              <div className="select-none opacity-20 blur-[3px]">
                <div className="grid grid-cols-3 gap-4">
                  {["ChatGPT", "Perplexity", "Claude"].map((engine) => (
                    <div key={engine} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{engine}</span>
                      </div>
                      <div className="h-3 w-full rounded bg-gray-300" />
                      <div className="h-3 w-4/5 rounded bg-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
              {/* 잠금 배지 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  <Icon name="lock" size={12} />
                  v1.1 출시 예정
                </span>
                <p className="text-xs text-gray-500">실제 LLM 인용률 측정 기능이 준비 중입니다</p>
              </div>
            </div>
          </Card>

          {/* AI 추천 개선 항목 — snapshot 기반 실측 파생 */}
          <Card>
            <CardTitle>AI 추천 개선 항목</CardTitle>
            {snapLoading ? (
              <div className="h-28 animate-pulse rounded-md bg-gray-100" />
            ) : snapshot ? (() => {
              const tips: { text: string; badge: string }[] = [];
              if (!snapshot.geo_files.llms_txt) tips.push({ text: "llms.txt 파일을 추가하면 AI 봇이 사이트를 쉽게 읽을 수 있습니다", badge: "GEO" });
              if (!snapshot.geo_files.llms_full_txt) tips.push({ text: "llms-full.txt에 FAQ를 추가해 AI 인용률을 높이세요", badge: "GEO" });
              if (!snapshot.json_ld.faq_page) tips.push({ text: "FAQPage JSON-LD를 추가하면 AI 검색 노출이 향상됩니다", badge: "JSON-LD" });
              if (!snapshot.json_ld.local_business) tips.push({ text: "LocalBusiness 스키마로 지역 AI 검색 노출을 개선하세요", badge: "JSON-LD" });
              if (snapshot.ssl_expiry_days !== null && snapshot.ssl_expiry_days < 60) tips.push({ text: `SSL 인증서 만료 ${snapshot.ssl_expiry_days}일 전 — 갱신을 확인하세요`, badge: "SSL" });
              if (snapshot.response_ms !== null && snapshot.response_ms > 2000) tips.push({ text: "응답속도가 느립니다. 이미지 최적화를 검토하세요", badge: "성능" });

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
                      <span className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-warning-50 text-[10px] font-bold text-warning-700">
                        {tip.badge.slice(0, 2)}
                      </span>
                      <span className="flex-1 text-sm leading-snug text-gray-700 [word-break:keep-all]">{tip.text}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push("/dashboard/ai-score")}
                    className={cn(ghostBtn, "mt-2 w-full justify-center")}
                  >
                    전체 확인
                    <Icon name="arrow-right" size={15} className="text-gray-500" />
                  </button>
                </div>
              );
            })() : null}
          </Card>
        </div>
      </div>
    </>
  );
}
