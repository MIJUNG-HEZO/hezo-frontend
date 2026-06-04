"use client";

export default function LLMCitationsDashboard() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM 인용 현황 및 유입 추적 리포트</h1>
          <p className="text-sm text-gray-500 mt-1">
            이 대시보드는 우리 사이트의 외부 효과를 측정합니다. ① LLM 답변에 등장하는가? ② 실제로 LLM이 방문하는가?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <span>📅</span>
            <span>2025.05.16 ~ 2025.05.22 (최근 7일)</span>
            <span>▾</span>
          </button>
          <span className="text-xs text-gray-400">최종 업데이트 2025.05.22 14:30</span>
          <button className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">🔄 리포트 새로고침</button>
        </div>
      </div>

      {/* 상단 4 요약 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">주간 인용률 ⓘ</span>
            <span className="text-green-500">📈</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">34.7</span>
            <span className="text-lg text-gray-400">%</span>
          </div>
          <p className="text-xs text-green-600 mt-1">전주 대비 +8.3%p ↗</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">LLM 유입 방문 ⓘ</span>
            <span className="text-gray-400">👥</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">128</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">일주일 기준</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">등장한 답변 수 ⓘ</span>
            <span className="text-gray-400">💬</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">17</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">직무 표준 쿼리 기준</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">외부 효과 종합 ⓘ</span>
            <span className="text-green-500">✓</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">양호</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">답변 등장 & 실제 방문 확인</p>
        </div>
      </div>

      {/* 중단: 엔진별 인용 현황 + 일별 추이 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 엔진별 인용 현황 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">엔진별 인용 현황 ⓘ</h3>
          <div className="space-y-4">
            {[
              { name: "ChatGPT", pct: 42.1, width: "42%" },
              { name: "Perplexity", pct: 31.4, width: "31%" },
              { name: "Claude", pct: 30.6, width: "31%" },
            ].map((engine) => (
              <div key={engine.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-20">{engine.name}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: engine.width }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{engine.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">각 엔진의 표준 쿼리 기준 인용률 (최근 7일)</p>
        </div>

        {/* 일별 LLM 유입 추이 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">일별 LLM 유입 추이 ⓘ</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-0.5 bg-green-500 inline-block"></span> LLM 유입 방문 수
            </div>
          </div>
          {/* 그래프 영역 */}
          <div className="h-40 flex items-end justify-between gap-2 px-2">
            {[
              { day: "05.16 (금)", val: 12 },
              { day: "05.17 (토)", val: 14 },
              { day: "05.18 (일)", val: 16 },
              { day: "05.19 (월)", val: 22 },
              { day: "05.20 (화)", val: 28 },
              { day: "05.21 (수)", val: 20 },
              { day: "05.22 (목)", val: 16 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{d.val}</span>
                <div className="w-full bg-green-100 rounded-t relative" style={{ height: `${(d.val / 30) * 100}%` }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full -mt-1"></div>
                </div>
                <span className="text-[9px] text-gray-400 mt-1">{d.day.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 표준 쿼리 인용 결과 + Referrer 추적 + 인사이트 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 표준 쿼리 인용 결과 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">표준 쿼리 인용 결과 ⓘ</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="text-left py-2 font-normal">표준 질의</th>
                <th className="text-center py-2 font-normal">ChatGPT</th>
                <th className="text-center py-2 font-normal">Perplexity</th>
                <th className="text-center py-2 font-normal">Claude</th>
                <th className="text-center py-2 font-normal">인용 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { q: "강남 한의원 추천", c: true, p: true, cl: false, status: "인용됨" },
                { q: "허리 통증 한의원", c: true, p: true, cl: true, status: "인용됨" },
                { q: "추나요법 비용", c: true, p: true, cl: false, status: "인용됨" },
                { q: "체질 개선 한약 효과", c: false, p: false, cl: false, status: "부분 인용" },
                { q: "교통사고 한의원 선택 기준", c: true, p: true, cl: false, status: "부분 인용" },
                { q: "다이어트 한약 부작용", c: false, p: false, cl: false, status: "미인용" },
              ].map((row, i) => (
                <tr key={i} className="text-gray-600">
                  <td className="py-2">{row.q}</td>
                  <td className="text-center">{row.c ? "🟢" : "⚫"}</td>
                  <td className="text-center">{row.p ? "🟢" : "⚫"}</td>
                  <td className="text-center">{row.cl ? "🟢" : "⚫"}</td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      row.status === "인용됨" ? "bg-green-50 text-green-700" :
                      row.status === "부분 인용" ? "bg-red-50 text-red-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-xs text-gray-400 mt-3 hover:text-gray-600">전체 보기 ›</button>
        </div>

        {/* Referrer 추적 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Referrer 추적 <span className="text-gray-400 font-normal">(최근 방문)</span></h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="text-left py-2 font-normal">시간</th>
                <th className="text-left py-2 font-normal">Referrer / 엔진</th>
                <th className="text-right py-2 font-normal">방문 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { time: "05.22 14:18", ref: "ChatGPT (chatgpt.com)", count: 8 },
                { time: "05.22 13:02", ref: "Perplexity (perplexity.ai)", count: 5 },
                { time: "05.22 11:47", ref: "Claude (claude.ai)", count: 4 },
                { time: "05.22 10:33", ref: "ChatGPT (chatgpt.com)", count: 7 },
                { time: "05.22 09:21", ref: "Perplexity (perplexity.ai)", count: 3 },
                { time: "05.22 08:15", ref: "Claude (claude.ai)", count: 2 },
              ].map((row, i) => (
                <tr key={i} className="text-gray-600">
                  <td className="py-2 text-gray-400">{row.time}</td>
                  <td className="py-2">{row.ref}</td>
                  <td className="py-2 text-right font-medium">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-xs text-gray-400 mt-3 hover:text-gray-600">전체 유입 추적 보기 ›</button>
        </div>

        {/* 인사이트 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">인사이트 ⓘ</h3>
          <div className="space-y-4">
            {[
              { num: 1, title: "FAQ 구조를 보강하면 인용 가능성이 높아집니다.", desc: "주요 상담 주제별 FAQ를 체계적으로 정리해 별도 매칭률을 높이세요." },
              { num: 2, title: "진료 서비스 페이지의 엔티티 일관성을 강화하세요.", desc: "진료명, 치료법, 증상명 등을 표준화하여 여러 페이지에 동일하게 노출하세요." },
              { num: 3, title: "자주 묻는 질문을 직무 표준 쿼리와 맞춰 확장하세요.", desc: "사용자 시드를 반영한 질문을 추가하면 인용 확률이 증가합니다." },
            ].map((insight) => (
              <div key={insight.num} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {insight.num}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{insight.desc}</p>
                </div>
                <span className="text-gray-300 ml-auto">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최하단: 요약 2카드 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl">💬</div>
          <div>
            <p className="text-xs text-gray-500">① LLM 답변에 등장하는가?</p>
            <p className="text-lg font-bold text-gray-900">네, 등장하고 있습니다.</p>
            <p className="text-xs text-gray-500">주간 인용률 34.7% · 등장한 답변 수 17건</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className="text-xs text-gray-500">② 실제로 LLM이 방문하는가?</p>
            <p className="text-lg font-bold text-gray-900">네, 방문하고 있습니다.</p>
            <p className="text-xs text-gray-500">주간 유입 방문 128회 · 일평균 18.3회</p>
          </div>
        </div>
      </div>
    </div>
  );
}
