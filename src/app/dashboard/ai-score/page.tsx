"use client";

export default function AIScoreDashboard() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 친화 구조화 수준 검증</h1>
          <p className="text-sm text-gray-500 mt-1">
            사이트가 편집되는 즉시 AI 친화도 점수를 생성합니다. 이 점수는 사이트의 내부 구조를 측정하며,
            AI가 내용을 더 잘 이해하고 인용할 수 있도록 돕습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">최근 검사: 2023.05.22 14:30</span>
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">🔄 다시 검사하기</button>
        </div>
      </div>

      {/* 상단: 점수 + 레이더 차트 + 레벨 + 개선 요약 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-3 gap-8">
          {/* 점수 + 레이더 */}
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-2">AI 친화도 점수</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">82</span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
              <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium">우수</span>
              <p className="text-xs text-gray-400 mt-3">AI가 이 사이트의 내용을 잘 이해하고<br/>인용할 가능성이 높습니다.</p>
            </div>
            {/* 레이더 차트 placeholder */}
            <div className="w-36 h-36 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                <polygon points="50,30 65,40 65,60 50,70 35,60 35,40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                <polygon points="50,15 78,33 80,62 50,82 22,65 20,32" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
              </svg>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] text-gray-500">시맨틱 HTML</div>
              <div className="absolute top-1/4 right-0 text-[9px] text-gray-500">메타 태그</div>
              <div className="absolute bottom-1/4 right-0 text-[9px] text-gray-500">한국어 청크</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-gray-500">엔티티 일관성</div>
              <div className="absolute bottom-1/4 left-0 text-[9px] text-gray-500">FAQ 구조</div>
              <div className="absolute top-1/4 left-0 text-[9px] text-gray-500">구조화 데이터</div>
            </div>
          </div>

          {/* AI 친화도 수준 */}
          <div>
            <h3 className="text-sm text-gray-500 mb-3">AI 친화도 수준</h3>
            <div className="space-y-2">
              {[
                { range: "90 - 100", label: "매우 우수", active: false },
                { range: "70 - 89", label: "우수", active: true },
                { range: "50 - 69", label: "보통", active: false },
                { range: "30 - 49", label: "개선 필요", active: false },
                { range: "0 - 29", label: "매우 낮음", active: false },
              ].map((level) => (
                <div key={level.range} className={`flex items-center gap-3 px-3 py-1.5 rounded ${level.active ? "bg-green-50" : ""}`}>
                  <span className={`text-xs font-mono ${level.active ? "text-green-700 font-bold" : "text-gray-400"}`}>{level.range}</span>
                  <span className={`text-xs ${level.active ? "text-green-700 font-medium" : "text-gray-500"}`}>{level.label}</span>
                  {level.active && <span className="text-green-500 ml-auto">◀</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 주요 개선 요약 */}
          <div>
            <h3 className="text-sm text-gray-500 mb-3">주요 개선 요약</h3>
            <ul className="space-y-2">
              {[
                "FAQ 구조 보완이 필요합니다.",
                "한국어 청크 길이가 다소 깁니다.",
                "좋습니다! 시맨틱 구조가 잘 적용되었습니다.",
                "메타 태그가 최적화되었습니다.",
                "구조화 데이터가 올바르게 적용되었습니다.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className={i < 2 ? "text-yellow-500" : "text-green-500"}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 항목별 분석 결과 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">항목별 분석 결과</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* 시맨틱 HTML */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{'</'} 시맨틱 HTML</span>
              <span className="text-lg font-bold text-gray-900">90<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">HTML 구조가 의미론적으로 올바르게 사용되었습니다.</p>
            <ul className="space-y-1.5">
              {["시맨틱 태그 사용", "계층적 구조(h1-h6)", "랜드마크 역할", "대체 텍스트"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">상세 보기</button>
          </div>

          {/* 메타 태그 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">🏷️ 메타 태그</span>
              <span className="text-lg font-bold text-gray-900">88<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">메타 정보가 적절하게 설정되었습니다.</p>
            <ul className="space-y-1.5">
              {["타이틀 태그", "메타 설명", "OG 태그", "트위터 카드"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">상세 보기</button>
          </div>

          {/* 한국어 청크 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">🔤 한국어 청크</span>
              <span className="text-lg font-bold text-gray-900">72<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">한국어 텍스트가 AI가 이해하기 좋은 단위로 분할되어 있습니다.</p>
            <span className="inline-block px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] rounded mb-2">다소 길</span>
            <ul className="space-y-1.5">
              {["평균 청크 길이", "문장 분리 최적화", "형태소 단위 분석", "키워드 밀도"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">상세 보기</button>
          </div>

          {/* 엔티티 일관성 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">🔗 엔티티 일관성</span>
              <span className="text-lg font-bold text-gray-900">78<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">주요 엔티티 정보의 일관성이 유지되고 있습니다.</p>
            <ul className="space-y-1.5">
              {["기관명 일관성", "의료 서비스 엔티티", "연락처 정보 일관성", "주소 일관성"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">상세 보기</button>
          </div>
        </div>

        {/* 두 번째 행 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* 구조화 데이터 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">📐 구조화 데이터</span>
              <span className="text-lg font-bold text-gray-900">92<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">구조화 데이터가 올바르게 구현되었습니다.</p>
            <ul className="space-y-1.5">
              {["Schema.org 적용", "JSON-LD 형식", "의료기관 스키마", "검증 통과"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">상세 보기</button>
          </div>

          {/* FAQ 구조 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">❓ FAQ 구조</span>
              <span className="text-lg font-bold text-gray-900">45<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-3">FAQ 콘텐츠가 부족합니다. AI가 답변을 생성하고 이해할 수 있습니다.</p>
            <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded mb-2">부족 (2개)</span>
            <ul className="space-y-1.5">
              {["FAQ 개수", "질문-답변 구조", "다양한 질문 유형", "구조화 마크업"].map((item, i) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={i < 2 ? "text-red-400" : "text-red-400"}>•</span>{item}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">개선 방법 보기</button>
          </div>

          {/* 개선 제안 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">개선 제안</h3>
            <p className="text-xs text-gray-500 mb-3">AI 친화도를 높이기 위해 다음 항목을 반영하는 것이 좋겠습니다.</p>
            <div className="space-y-3">
              {[
                { num: 1, text: "FAQ 콘텐츠 확장", desc: "자주 묻는 질문을 AI가 더 잘 답변할 수 있도록 추가하세요." },
                { num: 2, text: "한국어 청크 최적화", desc: "프론트, 사이트 등 97 이내의 청크로 수정하세요." },
                { num: 3, text: "엔티티 정보 보완", desc: "프론트, 사이트 등 97 이내의 청크로 수정하세요." },
              ].map((item) => (
                <div key={item.num} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{item.num}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{item.text}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700">FAQ 콘텐츠 이동</button>
              <button className="w-full py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">콘텐츠 최적화 가이드</button>
              <button className="w-full py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">엔티티 관리</button>
            </div>
          </div>
        </div>
      </div>

      {/* 최하단 요약 바 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">🏆 전체 요약</p>
            <p className="text-sm text-gray-700">현재 AI 친화도 점수는 82점으로 우수한 수준입니다.<br/>위의 개선 항목을 반영하면 90점 이상 달성이 가능합니다.</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">📈 예상 개선 점수</p>
            <p className="text-sm text-gray-600">+12점 상승 가능</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "82%" }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">82 → 94</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">📅 다음 검사 예정</p>
            <p className="text-sm font-medium text-gray-700">2025.05.29 (7일 후)</p>
            <button className="mt-2 text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">검사 일정 변경</button>
          </div>
        </div>
      </div>
    </div>
  );
}
