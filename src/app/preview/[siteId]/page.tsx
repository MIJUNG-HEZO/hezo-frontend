"use client";

export default function PreviewPage() {
  return (
    <div className="bg-white -m-8">
      {/* 사이트 네비게이션 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-gray-800 flex items-center gap-2">🌿 바른한의원</span>
            <nav className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-green-700">진료안내</a>
              <a href="#" className="hover:text-green-700">의료진</a>
              <a href="#" className="hover:text-green-700">치료프로그램</a>
              <a href="#" className="hover:text-green-700">후기</a>
              <a href="#" className="hover:text-green-700">FAQ</a>
              <a href="#" className="hover:text-green-700">블로그</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">02-123-4567</span>
            <button className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800">예약하기</button>
            <span className="px-3 py-1 border border-green-500 text-green-700 text-xs rounded-full flex items-center gap-1">AI Optimized ✓</span>
          </div>
        </div>
        {/* AI 구조 자동 적용 배너 */}
        <div className="bg-green-50 text-center py-1.5 text-[11px] text-green-700">
          ✨ AI 친화 구조가 자동 적용되었습니다
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-6xl mx-auto px-6 py-20 flex items-center justify-between">
          <div className="max-w-lg">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              자연의 치유력으로<br/>건강한 삶을 되찾아 드립니다
            </h1>
            <p className="text-gray-600 mb-6">
              바른 전료, 바른 치료, 바른 마음으로<br/>
              환자 한 분 한 분의 삶에 맞는 치료를 제공합니다.
            </p>
            <button className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800">
              진료 예약하기
            </button>
          </div>
          <div className="w-96 h-64 bg-gray-200 rounded-2xl"></div>
        </div>
        {/* AI 친화 구조 뱃지 */}
        <div className="absolute bottom-6 right-6 flex gap-3">
          {["FAQ Structured", "Schema Applied", "LLM Ready", "Semantic HTML", "Structured Data"].map((badge) => (
            <span key={badge} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] text-gray-600 flex items-center gap-1">
              ✓ {badge}
            </span>
          ))}
        </div>
      </section>

      {/* 핵심 가치 4카드 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-6">
          {[
            { icon: "🎯", title: "맞춤 치료", desc: "개인 체질과 증상에 맞춘\n1:1 맞춤 치료" },
            { icon: "🌿", title: "자연 치료", desc: "자연에서 찾은 안전하고\n효과적인 치료" },
            { icon: "❤️", title: "정성 진료", desc: "환자 한 분 한 분에게\n정성을 다하는 진료" },
            { icon: "🏥", title: "믿을 수 있는 한의원", desc: "풍부한 경험과 체계적인\n의료 시스템" },
          ].map((card) => (
            <div key={card.title} className="text-center p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <span className="text-2xl mb-3 block">{card.icon}</span>
              <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-xs text-gray-500 whitespace-pre-line">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 진료 안내 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">진료 안내</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { title: "침 치료", desc: "경혈 자극을 통해 기혈 순환을 돕고 통증과 질환을 치료합니다." },
            { title: "한약 처방", desc: "개인 체질과 증상에 맞는 맞춤 한약을 처방합니다." },
            { title: "뜸 치료", desc: "온열 자극으로 기혈 순환을 촉진하고, 면역력을 강화합니다." },
            { title: "부항 치료", desc: "어혈 제거와 근육 이완을 통해 통증을 완화합니다." },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100"></div>
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
                <a href="#" className="text-xs text-green-700 mt-2 inline-block hover:underline">자세히 보기 ›</a>
              </div>
            </div>
          ))}
          {/* 진료 시간 안내 카드 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-800 mb-3 text-sm">진료 시간 안내</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>평일</span><span>AM 09:30 - PM 06:30</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>점심시간</span><span>PM 01:00 - PM 02:00</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>토요일</span><span>AM 09:30 - PM 01:30</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>일요일/공휴일</span><span>휴진</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-green-300 rounded-lg text-xs text-green-700 hover:bg-green-100">
              📍 오시는 길
            </button>
          </div>
        </div>
      </section>

      {/* 환자 후기 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">환자 후기</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { stars: 5, text: '"만성 통증이 3개월만에 크게 호전되었어요. 치료 후 삶이 가벼워지고 활력이 생겼어요. 정말 감동입니다."', name: "김OO님", info: "30대 여성" },
            { stars: 5, text: '"한약 복용으로 오래 고생했던 비염이 크게 좋아졌는데, 상 자세하고 전문적이고 치료효과가 뛰어나고 만족합니다."', name: "이OO님", info: "40대 남성" },
            { stars: 5, text: '"무릎 반월판 손상 후 한방치료를 받으면서 수술 없이 회복하였습니다. 치료 결과에 매우 만족합니다."', name: "박OO님", info: "10대 자녀 보호자" },
          ].map((review, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex gap-0.5 mb-3">
                {Array(review.stars).fill(0).map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.text}</p>
              <p className="text-xs text-gray-400">{review.name} | {review.info}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI 검색·LLM 노출 최적화 배지 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-center font-bold text-gray-800 mb-2">AI 검색·LLM 노출 최적화</h3>
          <p className="text-center text-xs text-gray-500 mb-6">이 사이트는 AI가 이해하기 쉬운 구조로 설계되어 각종 LLM에서 더 잘 노출됩니다.</p>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: "📋", label: "Schema.org 적용" },
              { icon: "❓", label: "FAQ 구조화" },
              { icon: "🤖", label: "한국어 최적화" },
              { icon: "🔗", label: "구조화된 데이터" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-5 gap-8 text-xs">
            <div>
              <h4 className="text-white font-medium mb-3">🌿 바른한의원</h4>
              <p className="leading-relaxed">서울특별시 강남구 태헤란로 123, 4층 (역삼동)<br/>사업자등록번호 123-45-67890</p>
              <p className="mt-2 text-gray-400">© 2025 바른한의원. All rights reserved.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">진료 안내</h4>
              <ul className="space-y-1 text-gray-400">
                <li>침 치료</li><li>한약 처방</li><li>뜸 치료</li><li>부항 치료</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">한의원 소개</h4>
              <ul className="space-y-1 text-gray-400">
                <li>한의원 소개</li><li>의료진 소개</li><li>진료 철학</li><li>오시는 길</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">고객센터</h4>
              <ul className="space-y-1 text-gray-400">
                <li>공지사항</li><li>자주 묻는 질문</li><li>상담 문의</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">문의 및 예약</h4>
              <p className="text-white text-sm mb-2">📞 02-123-4567</p>
              <p className="text-gray-400">✉ 문의@baren-hanclinic.com</p>
              <p className="text-gray-400 mt-1">💬 카카오톡 상담 @바른한의원</p>
            </div>
          </div>
          {/* AI 친화 구조 자동 적용 뱃지 */}
          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-lg">
              <span className="text-green-400 text-sm">✓</span>
              <div>
                <p className="text-green-300 text-[10px] font-medium">AI 친화 구조 자동 적용</p>
                <p className="text-green-400/70 text-[9px]">지속적으로 AI 활용에 최적화된 구조를 유지합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
