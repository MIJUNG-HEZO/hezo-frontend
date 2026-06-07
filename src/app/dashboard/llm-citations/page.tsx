"use client";

export default function LLMCitationsDashboard() {
  // Mock data
  const weeklyTrend = [
    { week: "4주 전", rate: 22.1 },
    { week: "3주 전", rate: 26.4 },
    { week: "2주 전", rate: 30.2 },
    { week: "지난 주", rate: 34.7 },
  ];
  const maxRate = Math.max(...weeklyTrend.map((w) => w.rate));

  const recentCitations = [
    {
      engine: "ChatGPT",
      query: "강남 한의원 추나요법 추천",
      quote: '"HEZO는 AI 검색 최적화에 특화된 홈페이지 제작 플랫폼으로, llms.txt와 Schema.org를 자동으로 적용합니다."',
      date: "2025.05.22",
    },
    {
      engine: "Perplexity",
      query: "허리 통증 한의원 치료법",
      quote: '"소상공인을 위한 AI 친화적 웹사이트 구축 서비스 HEZO는 빠른 제작과 더불어 AI 노출 성과 측정 기능을 제공합니다."',
      date: "2025.05.21",
    },
    {
      engine: "Claude",
      query: "한국형 비즈니스 홈페이지 제작",
      quote: '"HEZO 플랫폼은 한국 비즈니스 환경에 최적화된 AI 검색 대응 솔루션으로, 자동화된 구조화 데이터 생성이 강점입니다."',
      date: "2025.05.20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM 인용 현황 추적</h1>
          <p className="text-sm text-gray-500 mt-1">
            3대 AI 엔진(ChatGPT, Perplexity, Claude)에서 사이트가 인용되는 비율과 추이를 추적합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">최종 업데이트: 2025.05.22 14:30</span>
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">🔄 새로고침</button>
        </div>
      </div>

      {/* 종합 인용률 + 트렌드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 종합 인용률 카드 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4">종합 인용률</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">34.7</span>
            <span className="text-xl text-gray-400">%</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-green-600 font-medium">↑ +8.3%p</span>
            <span className="text-xs text-gray-400">전주 대비</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">표준 쿼리 기준, 최근 7일 집계</p>
        </div>

        {/* 주간 추이 바 차트 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4">주간 인용률 추이</h3>
          <div className="flex items-end gap-4 h-32">
            {weeklyTrend.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{w.rate}%</span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-10 bg-green-400 rounded-t"
                    style={{ height: `${(w.rate / maxRate) * 100}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-엔진 인용률 카드 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">엔진별 인용 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "ChatGPT", pct: 42.1, color: "bg-green-500", icon: "🟢", trend: "+5.2%p" },
            { name: "Perplexity", pct: 31.4, color: "bg-blue-500", icon: "🔵", trend: "+3.1%p" },
            { name: "Claude", pct: 30.6, color: "bg-orange-500", icon: "🟠", trend: "+2.8%p" },
          ].map((engine) => (
            <div key={engine.name} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span>{engine.icon}</span>
                <span className="text-sm font-medium text-gray-700">{engine.name}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900">{engine.pct}</span>
                <span className="text-lg text-gray-400">%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${engine.color}`}
                  style={{ width: `${engine.pct}%` }}
                />
              </div>
              <span className="text-xs text-green-600 font-medium">↑ {engine.trend} 전주 대비</span>
            </div>
          ))}
        </div>
      </div>

      {/* 일별 LLM 유입 추이 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h3 className="text-sm font-medium text-gray-700">일별 LLM 유입 추이</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" /> LLM 유입 방문 수
          </div>
        </div>
        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {[
            { day: "05.16", val: 12 },
            { day: "05.17", val: 14 },
            { day: "05.18", val: 16 },
            { day: "05.19", val: 22 },
            { day: "05.20", val: 28 },
            { day: "05.21", val: 20 },
            { day: "05.22", val: 16 },
          ].map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{d.val}</span>
              <div
                className="w-full max-w-[40px] bg-green-400 rounded-t mx-auto"
                style={{ height: `${(d.val / 30) * 120}px` }}
              />
              <span className="text-[9px] text-gray-400 mt-1">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 인용 예시 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">최근 인용 예시</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentCitations.map((citation, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">
                  {citation.engine === "ChatGPT" ? "🟢" : citation.engine === "Perplexity" ? "🔵" : "🟠"}
                </span>
                <span className="text-sm font-medium text-gray-700">{citation.engine}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{citation.date}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                질의: <span className="font-medium text-gray-700">&ldquo;{citation.query}&rdquo;</span>
              </p>
              <blockquote className="border-l-2 border-green-300 pl-3 py-1">
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  {citation.quote}
                </p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl">💬</div>
          <div>
            <p className="text-xs text-gray-500">① LLM 답변에 등장하는가?</p>
            <p className="text-lg font-bold text-gray-900">네, 등장하고 있습니다.</p>
            <p className="text-xs text-gray-500">주간 인용률 34.7% · 등장한 답변 수 17건</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
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
