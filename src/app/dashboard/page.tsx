"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatModal from "@/components/chat/ChatModal";
import PricingModal from "@/components/chat/PricingModal";
import AgreementModal from "@/components/chat/AgreementModal";
import OnboardingDashboard from "@/components/dashboard/OnboardingDashboard";
import { useQuery } from "@tanstack/react-query";
import { api, getSubscriptionStatus, getSites, getMonitoringSnapshot, getMonitoringHistory } from "@/lib/api";
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

function Delta({ up, children }: { up?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[13.5px] font-semibold",
        up ? "text-success-600" : "text-error-600",
      )}
    >
      <Icon name={up ? "trending-up" : "trending-down"} size={15} />
      {children}
    </span>
  );
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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated()) return;

    // API에서 발급된(published) 사이트 유무 확인 + activeSiteId 설정
    getSites()
      .then((sites) => {
        const published = sites.filter((s) => s.is_published);
        setHasSite(published.length > 0);
        const saved = typeof window !== "undefined" ? localStorage.getItem("hezo_active_site") : null;
        setActiveSiteId(published.find((s) => s.id === saved)?.id ?? published[0]?.id ?? null);
      })
      .catch(() => setHasSite(false));

    // 구독 상태 가져오기
    getSubscriptionStatus()
      .then((status) => {
        setUserPlan(status.plan);
        setSitesUsed(status.sites_used);
        setSitesLimit(status.sites_limit);
      })
      .catch(() => {});
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
        <button className={ghostBtn}>
          <Icon name="calendar" size={16} className="text-gray-500" />
          2025.07.15 – 07.21
        </button>
        <button
          className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100"
          aria-label="알림"
        >
          <Icon name="bell" size={18} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
            2
          </span>
        </button>
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
            <CardTitle>신규 문의 &amp; 예약</CardTitle>
            <div className="font-display text-[40px] font-bold tracking-[-0.02em] text-gray-900">23</div>
            <div className="mb-0.5 mt-1 text-xs text-gray-400">지난 주 대비</div>
            <Delta up>15.0%</Delta>
            <MiniBars data={[40, 55, 30, 65, 50, 60, 70]} color="bg-warning-200" />
          </Card>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardTitle>최근 LLM 인용 예시</CardTitle>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
              {[
                { engine: "ChatGPT", color: "bg-primary-500", text: "HEZO는 AI 검색 최적화에 특화된 홈페이지 제작 플랫폼으로, llms.txt와 Schema.org를 자동으로 적용합니다.", ago: "3일 전" },
                { engine: "Perplexity", color: "bg-blue-500", text: "소상공인을 위한 AI 친화적 웹사이트 구축 서비스 HEZO는 빠른 제작과 AI 노출 성과 측정 기능을 제공합니다.", ago: "5일 전" },
                { engine: "Claude", color: "bg-warning-500", text: "HEZO 플랫폼은 한국 비즈니스 환경에 최적화된 AI 검색 대응 솔루션으로, 자동화된 구조화 데이터 생성이 강점입니다.", ago: "5일 전" },
              ].map((it) => (
                <div key={it.engine} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-5 w-5 rounded-full", it.color)} />
                    <span className="text-[13.5px] font-semibold text-gray-900">{it.engine}</span>
                  </div>
                  <p className="text-[12.5px] leading-[1.6] text-gray-500 [word-break:keep-all]">
                    &ldquo;{it.text}&rdquo;
                  </p>
                  <span className="text-[11px] text-gray-400">{it.ago}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>AI 추천 개선 항목</CardTitle>
            <div className="flex flex-col gap-3">
              {[
                ["FAQ 페이지 질문 수를 늘려보세요", "+5점"],
                ["핵심 서비스 페이지 메타 설명 추가", "+3점"],
                ["이미지 alt 텍스트 보완", "+2점"],
              ].map(([t, s]) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-primary-50">
                    <Icon name="arrow-up" size={13} className="text-primary-600" />
                  </span>
                  <span className="flex-1 text-sm text-gray-700 [word-break:keep-all]">{t}</span>
                  <span className="text-sm font-semibold text-primary-600">{s}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/dashboard/ai-score")}
              className={cn(ghostBtn, "mt-[18px] w-full justify-center")}
            >
              전체 개선 항목 보기
              <Icon name="arrow-right" size={15} className="text-gray-500" />
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}
