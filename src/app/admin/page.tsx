"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface PipelineItem {
  site_id: string;
  publish_status: string;
  attempt: number | null;
  updated_at: string | null;
  error_message: string | null;
}

interface PipelineListResponse {
  items: PipelineItem[];
  total: number;
}

const statusBadge: Record<string, { color: "success" | "warning" | "error" | "gray"; label: string }> = {
  published:    { color: "success", label: "발급 완료" },
  building:     { color: "warning", label: "빌드 중" },
  validating:   { color: "warning", label: "검증 중" },
  provisioning: { color: "warning", label: "인프라 중" },
  failed:       { color: "error",   label: "실패" },
  rolled_back:  { color: "error",   label: "롤백" },
};

function PipelineStats({ items }: { items: PipelineItem[] }) {
  const counts = {
    published:  items.filter((i) => i.publish_status === "published").length,
    inProgress: items.filter((i) => ["building", "validating", "provisioning"].includes(i.publish_status)).length,
    failed:     items.filter((i) => ["failed", "rolled_back"].includes(i.publish_status)).length,
  };
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "발급 완료", value: counts.published, color: "text-success-600" },
        { label: "진행 중",   value: counts.inProgress, color: "text-warning-600" },
        { label: "실패",      value: counts.failed,     color: "text-error-600" },
      ].map(({ label, value, color }) => (
        <Card key={label}>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cwUrl = process.env.NEXT_PUBLIC_CW_DASHBOARD_URL;
  const grafanaUrl = process.env.NEXT_PUBLIC_GRAFANA_URL;

  useEffect(() => {
    const fetchPipeline = () =>
      api.get("api/v1/admin/pipeline")
        .json<PipelineListResponse>()
        .then((res) => setItems(res.items))
        .catch(() => {})
        .finally(() => setLoading(false));

    fetchPipeline();
    const timer = setInterval(fetchPipeline, 10_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <TopBar title="HEZO 어드민" subtitle="파이프라인 현황 및 CloudWatch 모니터링" />
      <div className="flex flex-col gap-6 p-8">
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        ) : (
          <PipelineStats items={items} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          {/* 파이프라인 테이블 */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-500">파이프라인 상태 목록</h3>
            <div className="flex flex-col gap-2">
              {items.length === 0 && !loading && (
                <p className="text-sm text-gray-400">데이터 없음</p>
              )}
              {items.map((item) => {
                const badge = statusBadge[item.publish_status] ?? { color: "gray" as const, label: item.publish_status };
                return (
                  <div key={item.site_id} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-gray-700">{item.site_id}</p>
                      {item.error_message && (
                        <p className="truncate text-[11px] text-error-500">{item.error_message}</p>
                      )}
                    </div>
                    <Badge color={badge.color} size="sm">{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CloudWatch 링크 */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-500">CloudWatch — HEZO-Admin</h3>
            <div className="flex h-[200px] flex-col items-center justify-center gap-4 rounded-md border border-dashed border-gray-200">
              {cwUrl ? (
                <>
                  <p className="text-sm text-gray-500">AWS CloudWatch 대시보드에서 에이전트 메트릭을 확인합니다.</p>
                  <a
                    href={cwUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    CloudWatch 대시보드 열기
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2h10v10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  <code>NEXT_PUBLIC_CW_DASHBOARD_URL</code> 환경변수를 설정하세요
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Studio 인프라 모니터링 — Grafana iframe */}
        {grafanaUrl && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-700">Studio 인프라 모니터링</h2>
              <span className="text-xs text-gray-400">ECS Fargate + RDS · Prometheus + Loki + Tempo</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <iframe
                src={`${grafanaUrl}/d/studio-infra?kiosk=tv&theme=light&from=now-1h&to=now`}
                width="100%"
                height="700"
                frameBorder="0"
                title="Studio 인프라 모니터링"
                className="block"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
