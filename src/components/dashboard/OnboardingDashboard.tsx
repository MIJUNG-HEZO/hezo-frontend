"use client";

interface OnboardingDashboardProps {
  onStartChat: () => void;
}

export default function OnboardingDashboard({ onStartChat }: OnboardingDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 환영 헤더 */}
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">👋</div>
        <h1 className="text-2xl font-bold text-gray-900">HEZO에 오신 것을 환영합니다</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          AI가 당신의 사업에 최적화된 홈페이지를 자동으로 만들어 드립니다.<br/>
          5분 대화로 시작해 보세요.
        </p>
      </div>

      {/* CTA 카드 */}
      <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">첫 번째 사이트를 만들어 보세요</h2>
        <p className="text-sm text-gray-500 mb-6">
          챗봇과 대화하면서 업종, 구조, 콘텐츠를 선택하면<br/>
          AI가 검색 친화 홈페이지를 자동 생성합니다.
        </p>
        <button
          onClick={onStartChat}
          className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm"
        >
          🚀 사이트 만들기 시작
        </button>
        <p className="text-xs text-gray-400 mt-3">예상 소요 시간: 5~10분 · 무료</p>
      </div>

      {/* 진행 과정 안내 */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">이렇게 진행됩니다</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: 1, icon: "💬", title: "AI 대화", desc: "챗봇에게 사업 정보를\n알려주세요" },
            { step: 2, icon: "🏗️", title: "구조 & 템플릿", desc: "업종에 맞는 구조와\n디자인을 선택하세요" },
            { step: 3, icon: "✨", title: "자동 생성", desc: "AI가 콘텐츠와 마크업을\n자동으로 만듭니다" },
            { step: 4, icon: "🚀", title: "발행", desc: "프리뷰 확인 후\n바로 라이브!" },
          ].map((item) => (
            <div key={item.step} className="text-center p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mx-auto mb-2">
                {item.step}
              </div>
              <span className="text-xl block mb-2">{item.icon}</span>
              <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
              <p className="text-[10px] text-gray-500 mt-1 whitespace-pre-line">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HEZO가 제공하는 것 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">HEZO가 자동으로 적용하는 것</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "🤖", title: "AI 검색 최적화", desc: "LLM이 콘텐츠를 읽고 인용할 수 있는 구조" },
            { icon: "📋", title: "Schema.org 마크업", desc: "검색 엔진과 AI가 이해하는 구조화 데이터" },
            { icon: "🇰🇷", title: "한국 비즈니스 컨텍스트", desc: "사업자등록번호, 약관 등 법적 요구사항 자동 적용" },
            { icon: "📊", title: "경쟁사 대비 분석", desc: "같은 업종 경쟁사와 비교한 상대 평가" },
            { icon: "🔗", title: "LLM 인용 추적", desc: "ChatGPT, Perplexity, Claude에서의 인용 모니터링" },
            { icon: "⚡", title: "원클릭 배포", desc: "프리뷰 확인 후 즉시 라이브, SSL 자동 적용" },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-800">{item.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 보조 링크 */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pb-4">
        <a href="#" className="hover:text-gray-600">📖 사용 가이드</a>
        <a href="#" className="hover:text-gray-600">💡 예시 사이트 보기</a>
        <a href="#" className="hover:text-gray-600">❓ 자주 묻는 질문</a>
      </div>
    </div>
  );
}
