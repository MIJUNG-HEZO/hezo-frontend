import { Section } from "./Section";
import { Icon, type IconName } from "@/components/ui/Icon";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

const feats: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "sparkles",
    title: "생성형 엔진 최적화 (GEO)",
    body: "시맨틱 HTML, 구조화 데이터, FAQ 스키마를 자동으로 적용해 ChatGPT·Perplexity가 내용을 정확히 읽고 인용합니다.",
  },
  {
    icon: "message-circle",
    title: "챗봇 기반 제작",
    body: "전문 지식은 필요 없습니다. 챗봇이 업종과 정보를 묻고, 글과 디자인은 AI가 알아서 채웁니다.",
  },
  {
    icon: "gauge",
    title: "AI 친화도 점수",
    body: "내 사이트가 AI 검색에 얼마나 친화적인지 100점으로 진단하고, 항목별로 무엇을 고쳐야 하는지 알려드립니다.",
  },
  {
    icon: "quote",
    title: "LLM 인용 추적",
    body: "ChatGPT, Perplexity, Claude가 실제로 내 사이트를 인용하는지 추적합니다. AI 검색 노출을 한눈에 확인하세요.",
  },
  {
    icon: "shield-check",
    title: "한국형 비즈니스 검증",
    body: "사업자등록번호, 통신판매업 신고, 전자상거래법 필수 표기를 자동으로 확인하고 사이트에 반영합니다.",
  },
  {
    icon: "chart-line",
    title: "발행 후 모니터링",
    body: "트래픽, 문의, AI 인용률을 대시보드 하나로. 사이트를 발행한 뒤에도 성과를 계속 관리합니다.",
  },
];

export function Features() {
  return (
    <Section id="features" className="py-24">
      <div className="mx-auto mb-14 max-w-[680px] text-center">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">
          기능
        </span>
        <h2
          className={`mb-3.5 mt-3 font-display text-[42px] font-bold tracking-[-0.04em] text-gray-900 ${kr}`}
        >
          AI 검색에 보이는 홈페이지의 모든 것
        </h2>
        <p className={`text-lg text-gray-500 ${kr}`}>
          예쁜 홈페이지를 넘어, AI가 찾고 추천하는 홈페이지를 만듭니다. 제작부터 검증,
          모니터링까지 HEZO 하나로.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {feats.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-3.5 rounded-xl bg-surface-card p-7 transition-colors hover:bg-gray-200"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon name={f.icon} size={20} className="text-primary-600" />
            </span>
            <h3 className={`font-display text-[18px] font-semibold text-gray-900 ${kr}`}>
              {f.title}
            </h3>
            <p className={`text-[15px] leading-[1.6] text-gray-500 ${kr}`}>{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
