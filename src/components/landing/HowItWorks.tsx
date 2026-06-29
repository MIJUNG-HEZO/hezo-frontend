import { Section } from "./Section";
import { Icon, type IconName } from "@/components/ui/Icon";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "message-circle",
    title: "챗봇과 대화하기",
    body: "업종, 상호, 강조하고 싶은 점을 챗봇에게 말해 주세요. 15분이면 충분합니다.",
  },
  {
    icon: "wand-sparkles",
    title: "AI가 사이트를 생성",
    body: "HEZO의 AI가 글, 디자인, 구조화 데이터까지 갖춘 홈페이지를 자동으로 만듭니다.",
  },
  {
    icon: "rocket",
    title: "발행하고 모니터링",
    body: "버튼 하나로 발행하고, AI 친화도 점수와 LLM 인용률을 추적하며 계속 개선합니다.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how" className="py-24">
      <div className="mx-auto mb-14 max-w-[680px] text-center">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">
          작동 방식
        </span>
        <h2
          className={`mb-3.5 mt-3 font-display text-[42px] font-bold tracking-[-0.04em] text-gray-900 ${kr}`}
        >
          대화 한 번이면, 사이트가 완성됩니다
        </h2>
        <p className={`text-lg text-gray-500 ${kr}`}>
          복잡한 제작 과정도, 마케팅 지식도 필요 없습니다. 세 단계면 AI 검색에 최적화된
          홈페이지가 생깁니다.
        </p>
      </div>

      <div className="relative grid grid-cols-3 gap-6">
        {/* Connecting dashed line */}
        <div className="absolute left-[calc(33.33%+0.75rem)] right-[calc(33.33%+0.75rem)] top-[54px] h-px border-t border-dashed border-gray-200" />

        {steps.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-xl border border-gray-200 bg-white p-7"
          >
            <div className="mb-[18px] flex items-center gap-3">
              <span className="inline-flex h-[52px] w-[52px] flex-none items-center justify-center rounded-xl bg-primary-500">
                <Icon name={s.icon} size={24} className="text-white" />
              </span>
              <span className="font-display text-[40px] font-extrabold tracking-[-0.02em] text-gray-200">
                0{i + 1}
              </span>
            </div>
            <h3 className={`mb-2.5 font-display text-[21px] font-semibold text-gray-900 ${kr}`}>
              {s.title}
            </h3>
            <p className={`text-[15.5px] leading-[1.6] text-gray-500 ${kr}`}>{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
