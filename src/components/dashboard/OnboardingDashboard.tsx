"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";

interface OnboardingDashboardProps {
  onStartChat: () => void;
}

const steps: { n: number; icon: IconName; title: string; desc: string }[] = [
  { n: 1, icon: "message-circle", title: "AI 대화", desc: "챗봇에게 사업 정보를 알려주세요" },
  { n: 2, icon: "layout-dashboard", title: "구조 & 템플릿", desc: "업종에 맞는 구조와 디자인을 선택하세요" },
  { n: 3, icon: "wand-sparkles", title: "자동 생성", desc: "AI가 콘텐츠와 마크업을 자동으로 만듭니다" },
  { n: 4, icon: "rocket", title: "발행", desc: "프리뷰 확인 후 바로 라이브!" },
];

const features: { icon: IconName; title: string; desc: string }[] = [
  { icon: "sparkles", title: "AI 검색 최적화", desc: "LLM이 콘텐츠를 읽고 인용할 수 있는 구조" },
  { icon: "braces", title: "Schema.org 마크업", desc: "검색 엔진과 AI가 이해하는 구조화 데이터" },
  { icon: "shield-check", title: "한국 비즈니스 컨텍스트", desc: "사업자등록번호, 약관 등 법적 요구사항 자동 적용" },
  { icon: "gauge", title: "경쟁사 대비 분석", desc: "같은 업종 경쟁사와 비교한 상대 평가" },
  { icon: "quote", title: "LLM 인용 추적", desc: "ChatGPT, Perplexity, Claude에서의 인용 모니터링" },
  { icon: "zap", title: "원클릭 배포", desc: "프리뷰 확인 후 즉시 라이브, SSL 자동 적용" },
];

export default function OnboardingDashboard({ onStartChat }: OnboardingDashboardProps) {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* 환영 헤더 */}
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50">
            <Icon name="sparkles" size={30} className="text-primary-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            HEZO에 오신 것을 환영합니다
          </h1>
          <p className="mx-auto mt-2 max-w-md text-gray-500 [word-break:keep-all]">
            AI가 당신의 사업에 최적화된 홈페이지를 자동으로 만들어 드립니다. 5분 대화로
            시작해 보세요.
          </p>
        </div>

        {/* CTA 카드 */}
        <div className="rounded-2xl border border-primary-200 bg-[linear-gradient(160deg,var(--color-primary-50),#fff_70%)] p-8 text-center">
          <h2 className="mb-2 font-display text-lg font-bold text-gray-900">
            첫 번째 사이트를 만들어 보세요
          </h2>
          <p className="mb-6 text-sm text-gray-500 [word-break:keep-all]">
            챗봇과 대화하면서 업종, 구조, 콘텐츠를 선택하면 AI가 검색 친화 홈페이지를 자동
            생성합니다.
          </p>
          <Button
            hierarchy="primary"
            size="xl"
            onClick={onStartChat}
            iconLeading={<Icon name="message-circle" size={18} />}
          >
            사이트 만들기 시작
          </Button>
          <p className="mt-3 text-xs text-gray-400">예상 소요 시간: 5~10분 · 무료</p>
        </div>

        {/* 진행 과정 */}
        <div>
          <h3 className="mb-4 text-center text-sm font-semibold text-gray-700">
            이렇게 진행됩니다
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {steps.map((s) => (
              <Card key={s.n} padding={20} className="text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {s.n}
                </div>
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                  <Icon name={s.icon} size={18} className="text-primary-600" />
                </span>
                <h4 className="text-sm font-semibold text-gray-800">{s.title}</h4>
                <p className="mt-1 text-[11px] text-gray-500 [word-break:keep-all]">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 제공 기능 */}
        <Card padding={24}>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            HEZO가 자동으로 적용하는 것
          </h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-50">
                  <Icon name={f.icon} size={18} className="text-primary-600" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{f.title}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 [word-break:keep-all]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 하단 보조 링크 */}
        <div className="flex items-center justify-center gap-6 pb-4 text-xs text-gray-400">
          <a href="#" className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-600">
            <Icon name="file-text" size={14} /> 사용 가이드
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-600">
            <Icon name="sparkles" size={14} /> 예시 사이트 보기
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-600">
            <Icon name="circle-help" size={14} /> 자주 묻는 질문
          </a>
        </div>
      </div>
    </div>
  );
}
