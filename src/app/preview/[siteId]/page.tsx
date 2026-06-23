"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getContractJson, getSubscriptionStatus, publishSite, type ContractJson } from "@/lib/api";
import { renderTemplate } from "@/lib/templateRenderer";
import PricingModal from "@/components/chat/PricingModal";
import { usePipelinePoller } from "@/hooks/usePipelinePoller";
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
  const [pipelineStarted, setPipelineStarted] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [domainUrl, setDomainUrl] = useState<string | null>(null);

  // Step Functions 실행 중일 때만 폴링 (3초 간격)
  const { status: pipelineStatus } = usePipelinePoller(siteId, pipelineStarted);

  // 파이프라인 상태 변화 처리
  useEffect(() => {
    if (!pipelineStatus) return;
    const ps = pipelineStatus.pipeline_status;

    if (ps === "published") {
      if (pipelineStatus.domain_url) {
        setDomainUrl(pipelineStatus.domain_url);
      } else {
        // 도메인 URL 없으면 대시보드로 이동
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      }
    }
    if (
      ps === "generation_failed" ||
      ps === "failed" ||
      ps === "rolled_back"
    ) {
      setPublishing(false);
      setPipelineStarted(false);
      setPublishError("홈페이지 생성에 실패했습니다. 다시 시도해주세요.");
    }
  }, [pipelineStatus]);

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
    setPublishError(null);
    try {
      const res = await publishSite(siteId);
      if (res.mode === "aws_pipeline") {
        // Step Functions 파이프라인 시작 — 폴링으로 완료 대기
        setPipelineStarted(true);
      } else {
        // 로컬 모드 — 즉시 완료
        setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
      }
    } catch (err: unknown) {
      setPublishing(false);
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response: Response }).response;
        if (res.status === 403) { setShowPricing(true); return; }
      }
      setPublishError("발급 요청에 실패했습니다. 다시 시도해주세요.");
    }
  }, [siteId]);

  const handlePublish = useCallback(() => {
    if (!canPublish) { setShowPricing(true); return; }
    doPublish();
  }, [canPublish, doPublish]);

  const publishDone = pipelineStatus?.pipeline_status === "published";

  const STAGE_LABELS: Record<string, { label: string; sub: string }> = {
    building:     { label: "홈페이지 콘텐츠 생성 중...",  sub: "AI가 맞춤 콘텐츠를 작성하고 있습니다" },
    validating:   { label: "품질 검증 중...",             sub: "GEO 구조 및 AI 친화성 검사 중" },
    provisioning: { label: "도메인 서버 구성 중...",      sub: "클라우드 인프라를 설정하고 있습니다 (약 5분)" },
    published:    { label: "발급 완료!",                  sub: "" },
    running:      { label: "파이프라인 실행 중...",        sub: "" },
  };

  const getStageInfo = (ps: string | undefined) =>
    STAGE_LABELS[ps ?? ""] ?? { label: "발급 처리 중...", sub: "" };

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
              {publishDone ? (
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

          {/* 우측: 액션 버튼 + 에러 */}
          <div className="flex items-center gap-2">
            {publishError && (
              <span className="text-xs text-red-400">{publishError}</span>
            )}
            <button
              onClick={() => window.open(window.location.href, "_blank")}
              className="hidden items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-200 sm:flex"
            >
              <Icon name="external-link" size={12} /> 새 탭
            </button>
            {publishDone ? (
              domainUrl ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-success-400">발급 완료 ✓</span>
                  <a
                    href={domainUrl.startsWith("http") ? domainUrl : `https://${domainUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-success-500 sm:px-5 sm:py-2 sm:text-sm"
                  >
                    <Icon name="external-link" size={13} /> 내 홈페이지 열기
                  </a>
                  <button
                    onClick={() => { window.location.href = "/dashboard"; }}
                    className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
                  >
                    대시보드
                  </button>
                </div>
              ) : (
                <span className="text-xs text-success-400">대시보드로 이동 중...</span>
              )
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
                  <span className="flex flex-col items-start gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <Icon name="refresh-cw" size={13} className="animate-spin" />
                      {getStageInfo(pipelineStatus?.pipeline_status).label}
                    </span>
                    {getStageInfo(pipelineStatus?.pipeline_status).sub && (
                      <span className="text-[10px] font-normal opacity-70 pl-[18px]">
                        {getStageInfo(pipelineStatus?.pipeline_status).sub}
                      </span>
                    )}
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
