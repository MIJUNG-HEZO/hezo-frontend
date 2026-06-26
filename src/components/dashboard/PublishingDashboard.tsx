"use client";

import { useEffect } from "react";
import { usePipelinePoller } from "@/hooks/usePipelinePoller";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface PublishingDashboardProps {
  siteId: string;
  onComplete: (domainUrl?: string) => void;
  onError: () => void;
}

const STAGES: { label: string; sub: string }[] = [
  { label: "AI 콘텐츠 생성 중...",   sub: "AI가 맞춤 콘텐츠를 작성하고 있습니다" },
  { label: "품질 검증 중...",          sub: "GEO 구조 및 AI 친화성 검사 중" },
  { label: "도메인 서버 구성 중...",  sub: "클라우드 인프라를 설정하고 있습니다 (약 5분)" },
  { label: "발급 완료!",               sub: "" },
];

function getActiveStep(ps: string | undefined): number {
  switch (ps) {
    case "validating":   return 1;
    case "provisioning": return 2;
    case "published":    return 3;
    default:             return 0;
  }
}

export default function PublishingDashboard({
  siteId,
  onComplete,
  onError,
}: PublishingDashboardProps) {
  const { status } = usePipelinePoller(siteId, true);

  useEffect(() => {
    if (!status) return;

    if (status.pipeline_status === "published") {
      const t = setTimeout(() => onComplete(status.domain_url), 2000);
      return () => clearTimeout(t);
    }

    if (
      status.pipeline_status === "failed" ||
      status.pipeline_status === "generation_failed" ||
      status.pipeline_status === "rolled_back"
    ) {
      onError();
    }
  }, [status, onComplete, onError]);

  const ps = status?.pipeline_status;
  const activeStep = getActiveStep(ps);
  const isDone = ps === "published";

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50">
            {isDone ? (
              <Icon name="circle-check-big" size={28} className="text-success-600" />
            ) : (
              <Icon name="rocket" size={26} className="animate-pulse text-primary-600" />
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900">
            {isDone ? "홈페이지 발급 완료!" : "홈페이지를 발급하고 있습니다"}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {isDone
              ? "잠시 후 대시보드로 이동합니다"
              : "창을 닫아도 발급은 계속 진행됩니다"}
          </p>
        </div>

        {/* 단계 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const isComplete = isDone || i < activeStep;
              const isActive   = !isDone && i === activeStep;

              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold transition-all",
                      isComplete
                        ? "bg-success-500 text-white"
                        : isActive
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {isComplete ? (
                      <Icon name="check" size={13} />
                    ) : isActive ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isComplete
                          ? "text-success-700"
                          : isActive
                            ? "text-primary-800"
                            : "text-gray-400",
                      )}
                    >
                      {stage.label}
                    </p>
                    {stage.sub && isActive && (
                      <p className="mt-0.5 text-xs text-gray-400">{stage.sub}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 완료 후 도메인 링크 */}
        {isDone && status?.domain_url && (
          <div className="mt-4 text-center">
            <a
              href={
                status.domain_url.startsWith("http")
                  ? status.domain_url
                  : `https://${status.domain_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-success-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-500"
            >
              <Icon name="external-link" size={15} />
              내 홈페이지 열기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
