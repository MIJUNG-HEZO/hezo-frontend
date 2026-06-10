import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// Distinct hue per AI engine for clearer differentiation.
const engineColor: Record<string, { fill: string; border: string }> = {
  ChatGPT: { fill: "bg-primary-500", border: "border-primary-300" },
  Perplexity: { fill: "bg-blue-500", border: "border-blue-300" },
  Claude: { fill: "bg-warning-500", border: "border-warning-300" },
};

const weeklyTrend = [
  { week: "4주 전", rate: 22.1 },
  { week: "3주 전", rate: 26.4 },
  { week: "2주 전", rate: 30.2 },
  { week: "지난 주", rate: 34.7 },
];
const maxRate = Math.max(...weeklyTrend.map((w) => w.rate));

const engines = [
  { name: "ChatGPT", pct: 42.1, trend: "+5.2%p" },
  { name: "Perplexity", pct: 31.4, trend: "+3.1%p" },
  { name: "Claude", pct: 30.6, trend: "+2.8%p" },
];

const dailyInflow = [
  { day: "05.16", val: 12 },
  { day: "05.17", val: 14 },
  { day: "05.18", val: 16 },
  { day: "05.19", val: 22 },
  { day: "05.20", val: 28 },
  { day: "05.21", val: 20 },
  { day: "05.22", val: 16 },
];

const recentCitations = [
  { engine: "ChatGPT", query: "강남 한의원 추나요법 추천", quote: "HEZO는 AI 검색 최적화에 특화된 홈페이지 제작 플랫폼으로, llms.txt와 Schema.org를 자동으로 적용합니다.", date: "2025.05.22" },
  { engine: "Perplexity", query: "허리 통증 한의원 치료법", quote: "소상공인을 위한 AI 친화적 웹사이트 구축 서비스 HEZO는 빠른 제작과 더불어 AI 노출 성과 측정 기능을 제공합니다.", date: "2025.05.21" },
  { engine: "Claude", query: "한국형 비즈니스 홈페이지 제작", quote: "HEZO 플랫폼은 한국 비즈니스 환경에 최적화된 AI 검색 대응 솔루션으로, 자동화된 구조화 데이터 생성이 강점입니다.", date: "2025.05.20" },
];

export default function LLMCitationsPage() {
  return (
    <>
      <TopBar
        title="LLM 인용 현황 추적"
        subtitle="3대 AI 엔진(ChatGPT, Perplexity, Claude)에서 사이트가 인용되는 비율과 추이를 추적합니다."
      >
        <span className="text-[12.5px] text-gray-400">최종 업데이트 2025.05.22 14:30</span>
        <button className={buttonVariants({ hierarchy: "secondary" })}>
          <Icon name="refresh-cw" size={16} className="text-gray-500" /> 새로고침
        </button>
      </TopBar>

      <div className="flex flex-col gap-6 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-500">종합 인용률</h3>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold tracking-[-0.02em] text-gray-900">34.7</span>
              <span className="text-xl text-gray-400">%</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-600">
                <Icon name="trending-up" size={15} /> +8.3%p
              </span>
              <span className="text-xs text-gray-400">전주 대비</span>
            </div>
            <p className="mt-3 text-xs text-gray-400">표준 쿼리 기준, 최근 7일 집계</p>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-500">주간 인용률 추이</h3>
            <div className="flex h-32 items-end gap-4">
              {weeklyTrend.map((w, i) => (
                <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{w.rate}%</span>
                  <div className="flex w-full justify-center">
                    <div
                      className={cn(
                        "w-10 rounded-t",
                        i === weeklyTrend.length - 1 ? "bg-primary-500" : "bg-primary-200",
                      )}
                      style={{ height: `${(w.rate / maxRate) * 100}px` }}
                    />
                  </div>
                  <span className="mt-1 text-[10px] text-gray-400">{w.week}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-gray-900">엔진별 인용 현황</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {engines.map((e) => (
              <Card key={e.name} padding={20}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", engineColor[e.name].fill)} />
                  <span className="text-sm font-semibold text-gray-700">{e.name}</span>
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold tracking-[-0.02em] text-gray-900">{e.pct}</span>
                  <span className="text-lg text-gray-400">%</span>
                </div>
                <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn("h-full rounded-full", engineColor[e.name].fill)}
                    style={{ width: `${e.pct}%` }}
                  />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600">
                  <Icon name="trending-up" size={14} /> {e.trend} 전주 대비
                </span>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-sm font-semibold text-gray-700">일별 LLM 유입 추이</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary-400" /> LLM 유입 방문 수
            </div>
          </div>
          <div className="flex h-40 items-end justify-between gap-2 px-2">
            {dailyInflow.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">{d.val}</span>
                <div
                  className="mx-auto w-full max-w-[40px] rounded-t bg-primary-400"
                  style={{ height: `${(d.val / 30) * 120}px` }}
                />
                <span className="mt-1 text-[9px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-gray-900">최근 인용 예시</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentCitations.map((c, i) => (
              <Card key={i} padding={20}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", engineColor[c.engine].fill)} />
                  <span className="text-sm font-semibold text-gray-700">{c.engine}</span>
                  <span className="ml-auto text-[10px] text-gray-400">{c.date}</span>
                </div>
                <p className="mb-2 text-xs text-gray-500">
                  질의: <span className="font-semibold text-gray-700">&ldquo;{c.query}&rdquo;</span>
                </p>
                <blockquote className={cn("border-l-2 py-1 pl-3", engineColor[c.engine].border)}>
                  <p className="text-xs italic leading-relaxed text-gray-600 [word-break:keep-all]">
                    &ldquo;{c.quote}&rdquo;
                  </p>
                </blockquote>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary-50">
                <Icon name="message-circle" size={24} className="text-primary-600" />
              </span>
              <div>
                <p className="text-xs text-gray-500">① LLM 답변에 등장하는가?</p>
                <p className="font-display text-lg font-bold text-gray-900">네, 등장하고 있습니다.</p>
                <p className="text-xs text-gray-500">주간 인용률 34.7% · 등장한 답변 수 17건</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-success-50">
                <Icon name="circle-check-big" size={24} className="text-success-600" />
              </span>
              <div>
                <p className="text-xs text-gray-500">② 실제로 LLM이 방문하는가?</p>
                <p className="font-display text-lg font-bold text-gray-900">네, 방문하고 있습니다.</p>
                <p className="text-xs text-gray-500">주간 유입 방문 128회 · 일평균 18.3회</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
