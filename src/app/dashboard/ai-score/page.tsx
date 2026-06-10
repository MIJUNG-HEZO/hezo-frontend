import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Ring } from "@/components/dashboard/Ring";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Status = "good" | "warn" | "bad";

const criteria: { name: string; score: number; icon: IconName; status: Status }[] = [
  { name: "llms.txt 존재 / 완성도", score: 85, icon: "file-text", status: "good" },
  { name: "Schema.org JSON-LD 커버리지", score: 92, icon: "braces", status: "good" },
  { name: "FAQ 구조 충실도", score: 45, icon: "circle-help", status: "bad" },
  { name: "시맨틱 HTML 비율", score: 90, icon: "code", status: "good" },
  { name: "메타 태그 충실도", score: 88, icon: "tag", status: "good" },
  { name: "한국어 청크 크기 분포", score: 72, icon: "type", status: "warn" },
  { name: "엔티티 일관성", score: 78, icon: "link", status: "warn" },
  { name: "페이지 속도", score: 95, icon: "zap", status: "good" },
];

const total = Math.round(
  criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length,
);

const statusBar: Record<Status, string> = {
  good: "bg-success-500",
  warn: "bg-warning-500",
  bad: "bg-error-500",
};
const statusText: Record<Status, string> = { good: "양호", warn: "보통", bad: "부족" };
const statusFg: Record<Status, string> = {
  good: "text-success-600",
  warn: "text-warning-600",
  bad: "text-error-600",
};

const levels = [
  { range: "90 – 100", label: "매우 우수", min: 90, max: 100 },
  { range: "70 – 89", label: "우수", min: 70, max: 89 },
  { range: "50 – 69", label: "보통", min: 50, max: 69 },
  { range: "30 – 49", label: "개선 필요", min: 30, max: 49 },
  { range: "0 – 29", label: "매우 낮음", min: 0, max: 29 },
];

const summaryItems: { t: string; warn: boolean }[] = [
  { t: "FAQ 구조 보완이 필요합니다.", warn: true },
  { t: "한국어 청크 길이가 다소 깁니다.", warn: true },
  { t: "시맨틱 구조가 잘 적용되었습니다.", warn: false },
  { t: "메타 태그가 최적화되었습니다.", warn: false },
  { t: "페이지 속도가 우수합니다.", warn: false },
];

const improvements = [
  { n: 1, title: "FAQ 콘텐츠 확장", desc: "자주 묻는 질문을 5개 이상 추가하면 AI 답변 노출 확률이 높아집니다.", impact: "+15점 예상", action: "FAQ 추가하기" },
  { n: 2, title: "한국어 청크 최적화", desc: "텍스트 블록을 200~400자 단위로 분할하여 AI 파싱 효율을 높이세요.", impact: "+8점 예상", action: "가이드 보기" },
  { n: 3, title: "엔티티 정보 보완", desc: "기관명, 주소, 연락처 등의 일관성을 전체 페이지에 걸쳐 강화하세요.", impact: "+5점 예상", action: "엔티티 관리" },
];

function SummaryHead({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <Icon name={icon} size={16} className="text-primary-600" />
      <span className="text-[13.5px] font-semibold text-gray-500">{title}</span>
    </div>
  );
}

export default function AIScorePage() {
  return (
    <>
      <TopBar
        title="AI 친화 구조화 수준 검증"
        subtitle="사이트의 AI 친화도를 8가지 기준으로 측정합니다. 점수가 높을수록 AI가 콘텐츠를 잘 이해하고 인용합니다."
      >
        <span className="text-[12.5px] text-gray-400">최근 검사 2025.05.22 14:30</span>
        <button className={buttonVariants({ hierarchy: "secondary" })}>
          <Icon name="refresh-cw" size={16} className="text-gray-500" />
          다시 검사하기
        </button>
      </TopBar>

      <div className="flex flex-col gap-6 p-8">
        {/* Overview */}
        <Card padding={28}>
          <div className="grid grid-cols-1 gap-9 md:grid-cols-[0.9fr_1fr_1fr]">
            {/* 종합 점수 */}
            <div className="flex flex-col items-center gap-3.5">
              <h3 className="text-sm font-semibold text-gray-500">종합 AI 친화도 점수</h3>
              <Ring value={total} size={148} stroke={12} />
              <Badge color="success" size="lg">우수</Badge>
            </div>

            {/* AI 친화도 수준 */}
            <div>
              <h3 className="mb-3.5 text-sm font-semibold text-gray-500">AI 친화도 수준</h3>
              <div className="flex flex-col gap-1">
                {levels.map((l) => {
                  const on = total >= l.min && total <= l.max;
                  return (
                    <div
                      key={l.range}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3 py-2",
                        on ? "border-primary-100 bg-primary-50" : "border-transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "min-w-16 font-mono text-[12.5px]",
                          on ? "font-bold text-primary-700" : "text-gray-400",
                        )}
                      >
                        {l.range}
                      </span>
                      <span
                        className={cn(
                          "text-[13.5px]",
                          on ? "font-semibold text-primary-700" : "text-gray-500",
                        )}
                      >
                        {l.label}
                      </span>
                      {on && (
                        <Icon name="chevron-left" size={16} className="ml-auto text-primary-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 주요 개선 요약 */}
            <div>
              <h3 className="mb-3.5 text-sm font-semibold text-gray-500">주요 개선 요약</h3>
              <ul className="flex flex-col gap-2.5">
                {summaryItems.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13.5px] text-gray-700 [word-break:keep-all]"
                  >
                    <span className="mt-px flex-none">
                      <Icon
                        name={it.warn ? "triangle-alert" : "circle-check-big"}
                        size={16}
                        className={it.warn ? "text-warning-500" : "text-success-600"}
                      />
                    </span>
                    {it.t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* 8가지 평가 기준 */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-gray-900">8가지 평가 기준</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {criteria.map((c) => (
              <Card key={c.name} padding={20}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                      <Icon name={c.icon} size={17} className="text-gray-500" />
                    </span>
                    <span className="text-sm font-semibold text-gray-700 [word-break:keep-all]">
                      {c.name}
                    </span>
                  </div>
                  <span className="flex-none font-display text-[19px] font-bold text-gray-900">
                    {c.score}
                    <span className="text-[13px] font-semibold text-gray-400">/100</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn("h-full rounded-full transition-all", statusBar[c.status])}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-[10.5px] text-gray-400">0</span>
                  <span className={cn("text-[11px] font-semibold", statusFg[c.status])}>
                    {statusText[c.status]}
                  </span>
                  <span className="text-[10.5px] text-gray-400">100</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 개선 제안 */}
        <Card padding={28}>
          <h2 className="mb-1.5 font-display text-lg font-bold text-gray-900">개선 제안</h2>
          <p className="mb-5 text-sm text-gray-500">
            AI 친화도를 높이기 위해 다음 항목을 반영하는 것이 좋겠습니다.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {improvements.map((it) => (
              <div key={it.n} className="rounded-xl border border-gray-200 p-[18px]">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[12.5px] font-bold text-primary-700">
                    {it.n}
                  </span>
                  <span className="text-[14.5px] font-semibold text-gray-900">{it.title}</span>
                </div>
                <p className="mb-4 min-h-[62px] text-[13px] leading-[1.6] text-gray-500 [word-break:keep-all]">
                  {it.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-primary-600">{it.impact}</span>
                  <button className="rounded-md border border-primary-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-primary-700 transition-colors hover:bg-primary-50">
                    {it.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 하단 요약 바 */}
        <Card padding={28}>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            <div>
              <SummaryHead icon="award" title="전체 요약" />
              <p className="text-sm leading-[1.6] text-gray-500 [word-break:keep-all]">
                현재 AI 친화도 점수는 <b className="text-gray-900">{total}점</b>으로 우수
                수준입니다. 위의 개선 항목을 반영하면 90점 이상 달성이 가능합니다.
              </p>
            </div>
            <div className="md:border-x md:border-gray-200 md:px-7">
              <SummaryHead icon="trending-up" title="예상 개선 점수" />
              <div className="mb-2.5 text-sm text-gray-700">
                +{Math.min(100 - total, 28)}점 상승 가능
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${total}%` }}
                />
              </div>
              <div className="mt-1.5 text-xs text-gray-400">
                {total} → {Math.min(total + 28, 100)}
              </div>
            </div>
            <div>
              <SummaryHead icon="calendar" title="다음 검사 예정" />
              <div className="mb-3 text-[15px] font-semibold text-gray-900">
                2025.05.29 <span className="text-[13px] font-normal text-gray-400">(7일 후)</span>
              </div>
              <button className="rounded-md border border-gray-300 bg-white px-3 py-[7px] text-[12.5px] font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                검사 일정 변경
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
