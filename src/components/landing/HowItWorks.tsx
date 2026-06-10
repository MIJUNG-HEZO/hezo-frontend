import { Section } from "./Section";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

const steps: { n: string; icon: IconName; title: string; body: string }[] = [
  {
    n: "01",
    icon: "message-circle",
    title: "챗봇과 대화하기",
    body: "업종, 상호, 강조하고 싶은 점을 챗봇에게 말해 주세요. 15분이면 충분합니다.",
  },
  {
    n: "02",
    icon: "wand-sparkles",
    title: "AI가 사이트를 생성",
    body: "HEZO의 AI가 글, 디자인, 구조화 데이터까지 갖춘 홈페이지를 자동으로 만듭니다.",
  },
  {
    n: "03",
    icon: "rocket",
    title: "발행하고 모니터링",
    body: "버튼 하나로 발행하고, AI 친화도 점수와 LLM 인용률을 추적하며 계속 개선합니다.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how" className="py-24">
      <div className="mx-auto mb-15 max-w-[680px] text-center">
        <Badge color="brand">작동 방식</Badge>
        <h2
          className={`mb-3.5 mt-4 font-display text-[38px] font-bold tracking-[-0.02em] text-gray-900 ${kr}`}
        >
          대화 한 번이면, 사이트가 완성됩니다
        </h2>
        <p className={`text-lg text-gray-500 ${kr}`}>
          복잡한 제작 과정도, 마케팅 지식도 필요 없습니다. 세 단계면 AI 검색에 최적화된
          홈페이지가 생깁니다.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-7">
        {steps.map((s) => (
          <div key={s.n} className="px-1 pt-1">
            <div className="mb-[18px] flex items-center gap-3">
              <span className="inline-flex h-13 w-13 items-center justify-center rounded-xl bg-primary-500 shadow-button-primary">
                <Icon name={s.icon} size={24} className="text-white" />
              </span>
              <span className="font-display text-[40px] font-extrabold tracking-[-0.02em] text-gray-200">
                {s.n}
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
