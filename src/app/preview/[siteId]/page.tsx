"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getContractJson, getSubscriptionStatus, publishSite, type ContractJson } from "@/lib/api";
import { renderTemplate } from "@/lib/templateRenderer";
import PricingModal from "@/components/chat/PricingModal";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const isEmbed = searchParams.get("embed") === "1";

  const [contract, setContract] = useState<ContractJson | null>(null);
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userPlan, setUserPlan] = useState<"free" | "pro" | "max">("free");
  const [canPublish, setCanPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [ct] = await Promise.all([
          getContractJson(siteId),
          getSubscriptionStatus().then((s) => {
            setUserPlan(s.plan);
            setCanPublish(s.can_publish);
          }).catch(() => {}),
        ]);
        setContract(ct);

        // 선택된 템플릿 + Contract JSON 결합
        const templateId = ct.template?.template_id;
        const structure = ct.template?.category;
        const html = await renderTemplate(ct, templateId, structure);
        setSrcdoc(html);
      } catch {
        setError("프리뷰를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [siteId]);

  const doPublish = useCallback(async () => {
    setPublishing(true);
    try {
      await publishSite(siteId);
      setPublishSuccess(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response: Response }).response;
        if (res.status === 403) setShowPricing(true);
      }
    } finally {
      setPublishing(false);
    }
  }, [siteId]);

  const handlePublish = useCallback(() => {
    if (!canPublish) { setShowPricing(true); return; }
    doPublish();
  }, [canPublish, doPublish]);

  /* ── 로딩 ── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900/40">
            <Icon name="sparkles" size={26} className="animate-pulse text-primary-400" />
          </div>
          <p className="text-sm text-gray-400">홈페이지 프리뷰 렌더링 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const brandName = contract?.brand?.name ?? "사이트";

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      {/* ── HEZO 액션 바 (embed=1 이면 숨김) ── */}
      {!isEmbed && (
        <div className="flex flex-none items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-2.5 sm:px-6">
          {/* 좌측: 브랜드 + 상태 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-md bg-primary-500 flex items-center justify-center">
                <Icon name="sparkles" size={11} className="text-white" />
              </div>
              <span className="font-display text-sm font-bold text-white">HEZO</span>
            </div>
            <span className="text-gray-600">|</span>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-gray-400 sm:inline">프리뷰 모드</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-300">{brandName}</span>
              {publishSuccess ? (
                <span className="rounded-full bg-success-500/20 px-2 py-0.5 text-[10px] font-medium text-success-400">
                  발급 완료 ✓
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400">
                  미발급
                </span>
              )}
            </div>
          </div>

          {/* 우측: 액션 버튼 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(window.location.href, "_blank")}
              className="hidden items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-200 sm:flex"
            >
              <Icon name="external-link" size={12} /> 새 탭
            </button>
            {publishSuccess ? (
              <span className="text-xs text-success-400">대시보드로 이동 중...</span>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all sm:px-5 sm:py-2 sm:text-sm",
                  publishing
                    ? "cursor-wait bg-primary-700 text-primary-200"
                    : "bg-primary-500 text-white hover:bg-primary-400 active:scale-95",
                )}
              >
                {publishing ? (
                  <span className="flex items-center gap-1.5">
                    <Icon name="refresh-cw" size={13} className="animate-spin" /> 발급 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Icon name="rocket" size={13} /> 사이트 발급하기
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 템플릿 iframe ── */}
      <div className="relative flex-1 overflow-hidden">
        {srcdoc ? (
          <iframe
            srcDoc={srcdoc}
            className="h-full w-full border-0"
            title={`${brandName} 홈페이지 프리뷰`}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="sparkles" size={24} className="animate-pulse text-gray-600" />
          </div>
        )}
      </div>

      {/* ── 업그레이드 모달 ── */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelect={(plan) => {
          setShowPricing(false);
          if (plan !== "free") {
            setUserPlan(plan as "free" | "pro" | "max");
            setCanPublish(true);
            doPublish();
          }
        }}
        currentPlan={userPlan}
        onSuccess={() => setCanPublish(true)}
      />
    </div>
  );
}
