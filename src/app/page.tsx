"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatModal from "@/components/chat/ChatModal";
import PricingModal from "@/components/chat/PricingModal";
import AgreementModal from "@/components/chat/AgreementModal";
import OnboardingDashboard from "@/components/dashboard/OnboardingDashboard";
import { api, getSubscriptionStatus } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth-guard";

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [hasSite, setHasSite] = useState<boolean | null>(null); // null = loading
  const [userPlan, setUserPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [sitesUsed, setSitesUsed] = useState(0);
  const [sitesLimit, setSitesLimit] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated()) return;

    // API에서 발급된(published) 사이트 유무 확인
    api.get("api/v1/sites").json<{ id: string; status: string }[]>()
      .then((sites) => setHasSite(sites.some((s) => s.status === "published")))
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
    // 한도 체크: starter이거나 한도에 도달했으면 업그레이드 모달
    if (userPlan === "starter" || sitesUsed >= sitesLimit) {
      setIsPricingOpen(true);
    } else {
      // 한도 미달: 바로 사이트 생성 플로우
      setIsAgreementOpen(true);
    }
  }, [userPlan, sitesUsed, sitesLimit]);

  useEffect(() => {
    if (hasSite !== null && searchParams.get("chat") === "open") {
      const timeoutId = window.setTimeout(handleNewSite, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, hasSite, handleNewSite]);

  const handlePlanSelect = (plan: string) => {
    setIsPricingOpen(false);
    setUserPlan(plan as "starter" | "pro" | "enterprise");
    // 업그레이드 후 한도 갱신
    getSubscriptionStatus()
      .then((status) => {
        setSitesUsed(status.sites_used);
        setSitesLimit(status.sites_limit);
        setUserPlan(status.plan);
      })
      .catch(() => {});
    // 업그레이드 후 사이트 생성 플로우 진행
    setIsAgreementOpen(true);
  };

  const handleAgreement = async () => {
    setAgreementLoading(true);
    try {
      // 사이트 생성 (user_id는 JWT에서 자동 추출됨)
      const site: { id: string } = await api.post("api/v1/sites", { json: { name: "", structure: "", template_id: "" } }).json();
      setCurrentSiteId(site.id);
      setIsAgreementOpen(false);
      setIsChatOpen(true);
    } catch (err) {
      console.error("Failed to create site:", err);
      alert("사이트 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setAgreementLoading(false);
    }
  };

  // 로딩 상태
  if (hasSite === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 사이트 미발급 → 온보딩 대시보드
  if (!hasSite) {
    return (
      <>
        <AgreementModal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} onAgree={handleAgreement} loading={agreementLoading} />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
        <OnboardingDashboard onStartChat={handleNewSite} />
      </>
    );
  }

  // 사이트 발급됨 → 기존 데이터 대시보드
  return (
    <div className="space-y-6">
      {/* 모달들 */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} siteId={currentSiteId} />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} onSelect={handlePlanSelect} currentPlan={userPlan} />
      <AgreementModal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} onAgree={handleAgreement} loading={agreementLoading} />

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">AI 검색 성과와 사이트 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewSite}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            ✨ 새 사이트 만들기
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <span>📅</span>
            <span>2025.07.15 - 2025.07.21</span>
            <span>▾</span>
          </button>
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            🔔
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">2</span>
          </button>
        </div>
      </div>

      {/* 상단 3카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI 친화도 점수 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">AI 친화도 점수</h3>
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">82</span>
                <span className="text-lg text-gray-400">/100</span>
              </div>
              <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded mt-1">우수</span>
              <p className="text-xs text-gray-400 mt-2">지난 주 대비</p>
              <p className="text-sm text-green-600 font-medium">↑ 12점</p>
            </div>
            {/* 원형 게이지 placeholder */}
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">82</span>
            </div>
          </div>
        </div>

        {/* LLM 인용 메트릭스 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">LLM 인용 메트릭스</h3>
          <div className="mb-3">
            <span className="text-xs text-gray-400">종합 인용률</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">34.7</span>
              <span className="text-lg text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">지난 주 대비</p>
            <p className="text-sm text-green-600 font-medium">↑ 8.3%p</p>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-600">ChatGPT</span>
              <span className="text-xs text-gray-900 ml-auto font-medium">42.1%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-xs text-gray-600">Perplexity</span>
              <span className="text-xs text-gray-900 ml-auto font-medium">31.4%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-300"></span>
              <span className="text-xs text-gray-600">Claude</span>
              <span className="text-xs text-gray-900 ml-auto font-medium">30.6%</span>
            </div>
          </div>
        </div>

        {/* 총 트래픽 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">총 트래픽</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">1,247</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">지난 주 대비</p>
          <p className="text-sm text-green-600 font-medium">↑ 18.6%</p>
          {/* 미니 그래프 placeholder */}
          <div className="mt-4 h-16 flex items-end gap-1">
            {[30, 45, 35, 55, 60, 50, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* 중단 3카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 신규 문의 & 예약 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">신규 문의 & 예약</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">23</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">지난 주 대비</p>
          <p className="text-sm text-green-600 font-medium">↑ 15.0%</p>
          {/* 바 차트 placeholder */}
          <div className="mt-4 h-16 flex items-end gap-2">
            {[40, 55, 30, 65, 50, 60, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-yellow-200 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>7/15</span><span>7/16</span><span>7/17</span><span>7/19</span><span>7/20</span><span>7/21</span>
          </div>
        </div>

        {/* 사이트 상태 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4">사이트 상태</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">사이트 가동률</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">100%</span>
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL 인증서</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">정상</span>
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">최근 백업</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">7시간 전</span>
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* 방문자 회원 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">방문자 회원</h3>
          <div>
            <span className="text-xs text-gray-400">총 회원 수</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">412</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">지난 주 대비</p>
            <p className="text-sm text-green-600 font-medium">↑ 24명</p>
          </div>
          {/* 라인 그래프 placeholder */}
          <div className="mt-4 h-16 flex items-end gap-1">
            {[20, 30, 35, 40, 55, 65, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 2카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 최근 LLM 인용 예시 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4">최근 LLM 인용 예시</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { engine: "ChatGPT", text: '"HEZO는 AI 검색 최적화에 특화된 홈페이지 제작 플랫폼으로, llms.txt와 Schema.org를 자동으로 적용합니다."', ago: "3일 전" },
              { engine: "Perplexity", text: '"소상공인을 위한 AI 친화적 웹사이트 구축 서비스 HEZO는 빠른 제작과 더불어 AI 노출을 성과 측정 기능을 제공합니다."', ago: "5일 전" },
              { engine: "Claude", text: '"HEZO 플랫폼은 한국 비즈니스 환경에 최적화된 AI 검색 대응 솔루션으로, 자동화된 구조화 데이터에 생성이 강점입니다."', ago: "5일 전" },
            ].map((item) => (
              <div key={item.engine} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                    {item.engine === "ChatGPT" ? "🟢" : item.engine === "Perplexity" ? "🔵" : "🟠"}
                  </span>
                  <span className="text-sm font-medium">{item.engine}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{item.text}</p>
                <p className="text-[10px] text-gray-400">{item.ago}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 추천 개선 항목 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4">AI 추천 개선 항목</h3>
          <div className="space-y-3">
            {[
              { text: "FAQ 페이지 질문 수를 늘려보세요", score: "+5점" },
              { text: "핵심 서비스 페이지 메타 설명 추가", score: "+3점" },
              { text: "이미지 alt 텍스트 보완", score: "+2점" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                <span className="flex-1 text-sm text-gray-700">{item.text}</span>
                <span className="text-sm font-medium text-green-600">{item.score}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            전체 개선 항목 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
