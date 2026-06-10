import { Section } from "./Section";

const stats: { value: string; suffix?: string; label: string }[] = [
  { value: "1,200+", label: "생성된 사이트" },
  { value: "3.4배", label: "평균 AI 인용률 상승" },
  { value: "15분", label: "평균 제작 시간" },
  { value: "82", suffix: "/100", label: "평균 AI 친화도 점수" },
];

export function Metrics() {
  return (
    <Section className="pb-[88px] pt-2">
      <div className="grid grid-cols-4 gap-6 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center gap-1.5 text-center ${i > 0 ? "border-l border-gray-200" : ""}`}
          >
            <div className="font-display text-[38px] font-bold tracking-[-0.02em] text-primary-600">
              {s.value}
              {s.suffix && (
                <span className="text-lg font-semibold text-gray-400">{s.suffix}</span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 [word-break:keep-all]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
