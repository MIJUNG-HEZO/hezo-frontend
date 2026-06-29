"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Ring } from "@/components/dashboard/Ring";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getSites, getMonitoringSnapshot, getScoreHistory } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth-guard";
import type { MonitoringSnapshot } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "good" | "warn" | "bad" | "na";

interface Criterion {
  name: string;
  score: number | null;
  icon: IconName;
  status: Status;
  detail: string;
}

// ── Score derivation ───────────────────────────────────────────────────────────

function toStatus(score: number | null): Status {
  if (score === null) return "na";
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function deriveCriteria(snapshot: MonitoringSnapshot): Criterion[] {
  const q = snapshot.llms_full_quality;
  const faqCount = q?.faq_count ?? 0;

  const jldActive = [
    snapshot.json_ld.local_business,
    snapshot.json_ld.faq_page,
    snapshot.json_ld.service,
  ].filter(Boolean);
  const jldScore = Math.round((jldActive.length / 3) * 100);

  const llmsTxtScore = !snapshot.geo_files.llms_txt
    ? 0
    : q?.has_core_pages
      ? 90
      : 65;

  const llmsFullScore = !snapshot.geo_files.llms_full_txt
    ? 0
    : faqCount >= 5
      ? 100
      : faqCount >= 3
        ? 80
        : faqCount >= 1
          ? 55
          : 35;

  const faqPageScore = snapshot.json_ld.faq_page
    ? 100
    : q?.has_faq
      ? 30
      : 0;

  const psValues = [snapshot.pagespeed_mobile, snapshot.pagespeed_desktop].filter(
    (v): v is number => v !== null,
  );
  const pageSpeedScore =
    psValues.length > 0
      ? Math.round(psValues.reduce((a, b) => a + b, 0) / psValues.length)
      : null;

  const ms = snapshot.response_ms;
  const responseScore =
    ms === null ? null : ms < 500 ? 100 : ms < 1000 ? 80 : ms < 2000 ? 50 : 20;

  return [
    {
      name: "llms.txt 존재 / 완성도",
      score: llmsTxtScore,
      icon: "file-text",
      status: toStatus(llmsTxtScore),
      detail: snapshot.geo_files.llms_txt
        ? q?.has_core_pages
          ? "핵심 페이지 섹션 포함"
          : "핵심 페이지 섹션 미포함"
        : "파일 없음",
    },
    {
      name: "llms-full.txt FAQ 충실도",
      score: llmsFullScore,
      icon: "clipboard-list",
      status: toStatus(llmsFullScore),
      detail: snapshot.geo_files.llms_full_txt
        ? `FAQ ${faqCount}개${faqCount >= 3 ? " (기준 충족)" : " (3개 이상 권장)"}`
        : "파일 없음",
    },
    {
      name: "JSON-LD 구조화 데이터",
      score: jldScore,
      icon: "braces",
      status: toStatus(jldScore),
      detail:
        jldActive.length > 0
          ? `${jldActive.length}/3 스키마 적용`
          : "구조화 데이터 없음",
    },
    {
      name: "FAQPage 스키마",
      score: faqPageScore,
      icon: "circle-help",
      status: toStatus(faqPageScore),
      detail: snapshot.json_ld.faq_page
        ? "JSON-LD 적용됨"
        : q?.has_faq
          ? "llms-full.txt에만 존재"
          : "미적용",
    },
    {
      name: "sitemap.xml",
      score: snapshot.geo_files.sitemap_xml ? 100 : 0,
      icon: "map-pin",
      status: toStatus(snapshot.geo_files.sitemap_xml ? 100 : 0),
      detail: snapshot.geo_files.sitemap_xml ? "정상" : "파일 없음",
    },
    {
      name: "robots.txt AI 봇 허용",
      score: snapshot.geo_files.robots_txt ? 100 : 0,
      icon: "shield-check",
      status: toStatus(snapshot.geo_files.robots_txt ? 100 : 0),
      detail: snapshot.geo_files.robots_txt
        ? "GPTBot · ClaudeBot · Yeti 허용"
        : "파일 없음",
    },
    {
      name: "페이지 속도",
      score: pageSpeedScore,
      icon: "zap",
      status: toStatus(pageSpeedScore),
      detail:
        pageSpeedScore !== null
          ? `모바일 ${snapshot.pagespeed_mobile ?? "–"} / 데스크탑 ${snapshot.pagespeed_desktop ?? "–"}`
          : "측정 중",
    },
    {
      name: "응답 속도",
      score: responseScore,
      icon: "clock",
      status: toStatus(responseScore),
      detail: ms !== null ? `${ms}ms` : "측정 중",
    },
  ];
}

/** 리포트 에이전트 실측값 없을 때 쓰는 프론트 실시간 fallback */
function computeFallbackScore(snapshot: MonitoringSnapshot): number {
  const geo = Object.values(snapshot.geo_files).filter(Boolean).length;
  const jld = Object.values(snapshot.json_ld).filter(Boolean).length;
  return Math.round(((geo / 4) * 50) + ((jld / 3) * 50));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const statusBar: Record<Status, string> = {
  good: "bg-success-500",
  warn: "bg-warning-400",
  bad: "bg-error-400",
  na: "bg-gray-200",
};

const statusText: Record<Status, string> = {
  good: "양호",
  warn: "보통",
  bad: "부족",
  na: "미측정",
};

const statusFg: Record<Status, string> = {
  good: "text-success-700",
  warn: "text-warning-700",
  bad: "text-error-600",
  na: "text-gray-400",
};

function CriterionCard({ c }: { c: Criterion }) {
  return (
    <Card padding={20}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-gray-200 bg-gray-50">
            <Icon name={c.icon} size={16} className="text-gray-500" />
          </span>
          <span className="text-sm font-semibold text-gray-700 [word-break:keep-all]">
            {c.name}
          </span>
        </div>
        <span className="flex-none font-display text-[19px] font-bold text-gray-900">
          {c.score !== null ? c.score : "–"}
          <span className="text-[13px] font-semibold text-gray-400">/100</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all", statusBar[c.status])}
          style={{ width: `${c.score ?? 0}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="truncate text-[11.5px] text-gray-400 [word-break:keep-all]">
          {c.detail}
        </span>
        <span className={cn("flex-none text-[11px] font-semibold", statusFg[c.status])}>
          {statusText[c.status]}
        </span>
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-md bg-gray-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-1.5 animate-pulse rounded-full bg-gray-100" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIScorePage() {
  const queryClient = useQueryClient();
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [siteResolved, setSiteResolved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("hezo_active_site") : null;
    getSites()
      .then((sites) => {
        const published = sites.filter((s) => s.is_published);
        const match = published.find((s) => s.id === saved) ?? published[0] ?? null;
        setActiveSiteId(match?.id ?? null);
      })
      .catch(() => {})
      .finally(() => setSiteResolved(true));
  }, []);

  const {
    data: snapshot,
    isLoading: snapLoading,
    isError: snapError,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["monitoring-snapshot", activeSiteId],
    queryFn: () => getMonitoringSnapshot(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: scoreHistory } = useQuery({
    queryKey: ["score-history", activeSiteId],
    queryFn: () => getScoreHistory(activeSiteId!),
    enabled: !!activeSiteId,
    staleTime: 1000 * 60 * 60 * 6,
  });

  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["monitoring-snapshot", activeSiteId] });
    void refetch();
  }, [queryClient, activeSiteId, refetch]);

  const criteria = snapshot ? deriveCriteria(snapshot) : null;
  // geo_file_score: 리포트 에이전트 실측 (10개 체크 기준) — 가장 정확
  // fallback: 프론트 실시간 계산 (존재 여부 binary) — 리포트 전 초기 상태
  const isFromReport = scoreHistory?.geo_file_score != null;
  const total = isFromReport
    ? scoreHistory!.geo_file_score
    : snapshot
      ? computeFallbackScore(snapshot)
      : null;
  const totalStatus = total !== null ? toStatus(total) : "na";
  const totalLabel =
    total !== null
      ? total >= 80
        ? "우수"
        : total >= 50
          ? "보통"
          : "개선 필요"
      : "–";

  const lastMeasuredAt = snapshot?.last_measured_at
    ? new Date(snapshot.last_measured_at).toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : dataUpdatedAt
      ? new Date(dataUpdatedAt).toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  // ── Improvement items ──────────────────────────────────────────────────────
  // Prefer Claude Haiku action_items from ScoreHistory; fallback to criteria hints.
  const actionItems: { level: "red" | "yellow" | "green"; text: string }[] =
    scoreHistory?.action_items.length
      ? scoreHistory.action_items
      : criteria
        ? criteria
            .filter((c) => c.status === "bad" || c.status === "warn")
            .slice(0, 4)
            .map((c) => ({
              level: c.status === "bad" ? ("red" as const) : ("yellow" as const),
              text: `${c.name}을 개선하면 AI 친화도가 향상됩니다.`,
            }))
        : [];

  const levelStyle: Record<string, string> = {
    red: "bg-error-50 text-error-700",
    yellow: "bg-warning-50 text-warning-700",
    green: "bg-success-50 text-success-700",
  };
  const levelLabel: Record<string, string> = { red: "긴급", yellow: "권고", green: "양호" };

  // ── Early: not authenticated ───────────────────────────────────────────────

  if (siteResolved && !activeSiteId) {
    return (
      <>
        <TopBar
          title="AI 친화 구조화 수준 검증"
          subtitle="사이트가 AI에 얼마나 잘 인식되는지 8가지 기준으로 측정합니다."
        />
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Icon name="gauge" size={24} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">발행된 사이트가 없습니다</p>
            <p className="mt-1 text-sm text-gray-400 [word-break:keep-all]">
              챗봇으로 사이트를 생성하고 발행하면 AI 친화도 점수를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="AI 친화 구조화 수준 검증"
        subtitle="사이트가 AI에 얼마나 잘 인식되는지 8가지 기준으로 측정합니다."
      >
        {lastMeasuredAt && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Icon name="clock" size={13} className="text-gray-300" />
            최근 측정 {lastMeasuredAt}
            {snapshot?.from_cache && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
                캐시
              </span>
            )}
          </span>
        )}
        <Button
          hierarchy="secondary"
          size="sm"
          onClick={handleRefetch}
          disabled={isFetching}
          iconLeading={
            <Icon
              name="refresh-cw"
              size={15}
              className={cn("text-gray-500", isFetching && "animate-spin")}
            />
          }
        >
          다시 검사하기
        </Button>
      </TopBar>

      <div className="flex flex-col gap-6 p-8">

        {/* ── Hero: 종합 점수 ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-400">
            AI 친화 구조화 종합점수
          </h3>
          {snapError ? (
            <div className="flex items-center gap-2.5 rounded-lg bg-error-900/20 px-3 py-3">
              <Icon name="circle-x" size={14} className="flex-none text-error-400" />
              <p className="text-xs text-error-300 [word-break:keep-all]">
                측정 데이터를 불러오지 못했습니다. 다시 검사해 주세요.
              </p>
            </div>
          ) : snapLoading || !siteResolved ? (
            <div className="flex items-end gap-8">
              <div className="h-24 w-24 animate-pulse rounded-full bg-gray-700" />
              <div className="flex flex-col gap-3">
                <div className="h-14 w-32 animate-pulse rounded bg-gray-700" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
              </div>
            </div>
          ) : total !== null ? (
            <div className="flex flex-wrap items-center gap-8">
              <Ring value={total} size={96} stroke={10} />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[52px] font-bold leading-none tracking-[-0.02em] text-white">
                    {total}
                  </span>
                  <span className="text-xl text-gray-600">/100</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      totalStatus === "good"
                        ? "bg-primary-500/20 text-primary-300"
                        : totalStatus === "warn"
                          ? "bg-warning-500/20 text-warning-300"
                          : "bg-error-500/20 text-error-300",
                    )}
                  >
                    {totalLabel}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {isFromReport ? "리포트 에이전트 주간 측정" : "실시간 측정 (리포트 대기 중)"}
                  </span>
                </div>
              </div>

              {/* score history bar mini */}
              {scoreHistory && scoreHistory.score_history.length > 1 && (() => {
                const trend = scoreHistory.score_history.slice(-7);
                const maxS = Math.max(...trend.map((p) => p.score), 1);
                return (
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-500">AI 가시성 점수 추이</span>
                    <div className="flex h-8 items-end gap-1.5">
                      {trend.map((p, i) => (
                        <div
                          key={i}
                          className="w-4 flex-none rounded-t-[2px] bg-primary-500/40"
                          style={{ height: `${Math.round((p.score / maxS) * 100)}%` }}
                          title={`${p.date}: ${p.score}점`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-600">
                      리포트 에이전트 weekly 측정
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>

        {/* ── 8가지 평가 기준 ─────────────────────────────────────────────── */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-gray-900">
            8가지 평가 기준
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {snapLoading || !siteResolved
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : snapError
                ? (
                  <div className="col-span-full flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-4">
                    <Icon name="triangle-alert" size={16} className="flex-none text-error-500" />
                    <p className="text-sm text-error-700 [word-break:keep-all]">
                      측정 데이터를 불러오지 못했습니다. 다시 검사 버튼을 눌러주세요.
                    </p>
                  </div>
                )
                : criteria
                  ? criteria.map((c) => <CriterionCard key={c.name} c={c} />)
                  : null}
          </div>
        </div>

        {/* ── 개선 제안 ────────────────────────────────────────────────────── */}
        {(snapLoading || actionItems.length > 0) && (
          <Card padding={28}>
            <h2 className="mb-1.5 font-display text-lg font-bold text-gray-900">
              개선 제안
            </h2>
            <p className="mb-5 text-sm text-gray-500 [word-break:keep-all]">
              {scoreHistory?.action_items.length
                ? "Claude Haiku 주간 분석 기반 개선 항목입니다."
                : "현재 측정 결과 기반 개선 항목입니다."}
            </p>
            {snapLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-6 w-8 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {actionItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "inline-flex h-[22px] min-w-[28px] flex-none items-center justify-center rounded-full text-[10px] font-semibold",
                        levelStyle[item.level],
                      )}
                    >
                      {levelLabel[item.level]}
                    </span>
                    <span className="flex-1 text-sm leading-snug text-gray-700 [word-break:keep-all]">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ── 하단 요약 ────────────────────────────────────────────────────── */}
        {!snapLoading && !snapError && snapshot && total !== null && (
          <Card padding={28}>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon name="award" size={15} className="text-primary-600" />
                  <span className="text-[13.5px] font-semibold text-gray-500">전체 요약</span>
                </div>
                <p className="text-sm leading-[1.6] text-gray-500 [word-break:keep-all]">
                  현재 AI 친화도 점수는{" "}
                  <b className="text-gray-900">{total}점</b>으로{" "}
                  {totalLabel} 수준입니다.{" "}
                  {total < 80 && "위의 개선 항목을 반영하면 점수를 높일 수 있습니다."}
                  {total >= 80 && "우수한 AI 친화 구조를 갖추고 있습니다."}
                </p>
              </div>
              <div className="md:border-x md:border-gray-200 md:px-7">
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon name="trending-up" size={15} className="text-primary-600" />
                  <span className="text-[13.5px] font-semibold text-gray-500">측정 현황</span>
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  {criteria?.filter((c) => c.status === "good").length ?? 0}개 양호 ·{" "}
                  {criteria?.filter((c) => c.status === "warn").length ?? 0}개 보통 ·{" "}
                  {criteria?.filter((c) => c.status === "bad").length ?? 0}개 부족
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${total}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-gray-400">{total} / 100</div>
              </div>
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon name="calendar" size={15} className="text-primary-600" />
                  <span className="text-[13.5px] font-semibold text-gray-500">다음 측정</span>
                </div>
                <div className="mb-3 text-[15px] font-semibold text-gray-900">
                  7일 후{" "}
                  <span className="text-[13px] font-normal text-gray-400">
                    (리포트 에이전트 주기)
                  </span>
                </div>
                <Button
                  hierarchy="secondary"
                  size="sm"
                  onClick={handleRefetch}
                  disabled={isFetching}
                >
                  지금 재측정
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
