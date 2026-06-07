"use client";

export default function AIScoreDashboard() {
  // 8 scoring criteria mock data
  const scoringCriteria = [
    { id: 1, name: "llms.txt 존재/완성도", score: 85, icon: "📄", status: "good" },
    { id: 2, name: "Schema.org JSON-LD 커버리지", score: 92, icon: "📐", status: "good" },
    { id: 3, name: "FAQ 구조 충실도", score: 45, icon: "❓", status: "bad" },
    { id: 4, name: "시맨틱 HTML 비율", score: 90, icon: "</", status: "good" },
    { id: 5, name: "메타 태그 충실도", score: 88, icon: "🏷️", status: "good" },
    { id: 6, name: "한국어 청크 크기 분포", score: 72, icon: "🔤", status: "warn" },
    { id: 7, name: "엔티티 일관성", score: 78, icon: "🔗", status: "warn" },
    { id: 8, name: "페이지 속도", score: 95, icon: "⚡", status: "good" },
  ];

  const totalScore = Math.round(
    scoringCriteria.reduce((sum, c) => sum + c.score, 0) / scoringCriteria.length
  );

  const getBarColor = (status: string) => {
    if (status === "good") return "bg-green-500";
    if (status === "warn") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { text: "매우 우수", color: "text-green-700 bg-green-50" };
    if (score >= 70) return { text: "우수", color: "text-green-700 bg-green-50" };
    if (score >= 50) return { text: "보통", color: "text-yellow-700 bg-yellow-50" };
    if (score >= 30) return { text: "개선 필요", color: "text-orange-700 bg-orange-50" };
    return { text: "매우 낮음", color: "text-red-700 bg-red-50" };
  };

  const scoreLabel = getScoreLabel(totalScore);

  // Circular progress calculation
  const circumference = 2 * Math.PI * 54; // radius 54
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 친화 구조화 수준 검증</h1>
          <p className="text-sm text-gray-500 mt-1">
            사이트의 AI 친화도를 8가지 기준으로 측정합니다. 점수가 높을수록 AI가 콘텐츠를 잘 이해하고 인용할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">최근 검사: 2025.05.22 14:30</span>
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">🔄 다시 검사하기</button>
        </div>
      </div>

      {/* 상단: 종합 점수 카드 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* 원형 프로그레스 */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm text-gray-500 mb-4">종합 AI 친화도 점수</h3>
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={totalScore >= 70 ? "#22c55e" : totalScore >= 50 ? "#eab308" : "#ef4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{totalScore}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
            </div>
            <span className={`mt-3 px-3 py-1 text-sm rounded-full font-medium ${scoreLabel.color}`}>
              {scoreLabel.text}
            </span>
          </div>

          {/* AI 친화도 수준 */}
          <div>
            <h3 className="text-sm text-gray-500 mb-3">AI 친화도 수준</h3>
            <div className="space-y-2">
              {[
                { range: "90 - 100", label: "매우 우수", min: 90, max: 100 },
                { range: "70 - 89", label: "우수", min: 70, max: 89 },
                { range: "50 - 69", label: "보통", min: 50, max: 69 },
                { range: "30 - 49", label: "개선 필요", min: 30, max: 49 },
                { range: "0 - 29", label: "매우 낮음", min: 0, max: 29 },
              ].map((level) => {
                const active = totalScore >= level.min && totalScore <= level.max;
                return (
                  <div key={level.range} className={`flex items-center gap-3 px-3 py-1.5 rounded ${active ? "bg-green-50" : ""}`}>
                    <span className={`text-xs font-mono ${active ? "text-green-700 font-bold" : "text-gray-400"}`}>{level.range}</span>
                    <span className={`text-xs ${active ? "text-green-700 font-medium" : "text-gray-500"}`}>{level.label}</span>
                    {active && <span className="text-green-500 ml-auto">◀</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 주요 개선 요약 */}
          <div>
            <h3 className="text-sm text-gray-500 mb-3">주요 개선 요약</h3>
            <ul className="space-y-2">
              {[
                { text: "FAQ 구조 보완이 필요합니다.", warn: true },
                { text: "한국어 청크 길이가 다소 깁니다.", warn: true },
                { text: "시맨틱 구조가 잘 적용되었습니다.", warn: false },
                { text: "메타 태그가 최적화되었습니다.", warn: false },
                { text: "페이지 속도가 우수합니다.", warn: false },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className={item.warn ? "text-yellow-500" : "text-green-500"}>•</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 8가지 평가 기준 프로그레스 바 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">8가지 평가 기준</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoringCriteria.map((criteria) => (
            <div key={criteria.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{criteria.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{criteria.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {criteria.score}<span className="text-sm text-gray-400">/100</span>
                </span>
              </div>
              {/* 프로그레스 바 */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(criteria.status)}`}
                  style={{ width: `${criteria.score}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-400">0</span>
                <span className={`text-[10px] font-medium ${
                  criteria.status === "good" ? "text-green-600" :
                  criteria.status === "warn" ? "text-yellow-600" : "text-red-600"
                }`}>
                  {criteria.status === "good" ? "양호" : criteria.status === "warn" ? "보통" : "부족"}
                </span>
                <span className="text-[10px] text-gray-400">100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 개선 제안 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">개선 제안</h2>
        <p className="text-sm text-gray-500 mb-4">AI 친화도를 높이기 위해 다음 항목을 반영하는 것이 좋겠습니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              num: 1,
              title: "FAQ 콘텐츠 확장",
              desc: "자주 묻는 질문을 5개 이상 추가하면 AI 답변 노출 확률이 높아집니다.",
              impact: "+15점 예상",
              action: "FAQ 추가하기",
            },
            {
              num: 2,
              title: "한국어 청크 최적화",
              desc: "텍스트 블록을 200~400자 단위로 분할하여 AI 파싱 효율을 높이세요.",
              impact: "+8점 예상",
              action: "가이드 보기",
            },
            {
              num: 3,
              title: "엔티티 정보 보완",
              desc: "기관명, 주소, 연락처 등의 일관성을 전체 페이지에 걸쳐 강화하세요.",
              impact: "+5점 예상",
              action: "엔티티 관리",
            },
          ].map((item) => (
            <div key={item.num} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {item.num}
                </span>
                <span className="text-sm font-medium text-gray-800">{item.title}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-600">{item.impact}</span>
                <button className="text-xs text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50">
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최하단 요약 바 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">🏆 전체 요약</p>
            <p className="text-sm text-gray-700">
              현재 AI 친화도 점수는 {totalScore}점으로 {scoreLabel.text} 수준입니다.
              <br />위의 개선 항목을 반영하면 90점 이상 달성이 가능합니다.
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">📈 예상 개선 점수</p>
            <p className="text-sm text-gray-600">+{100 - totalScore > 28 ? 28 : 100 - totalScore}점 상승 가능</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalScore}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{totalScore} → {Math.min(totalScore + 28, 100)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">📅 다음 검사 예정</p>
            <p className="text-sm font-medium text-gray-700">2025.05.29 (7일 후)</p>
            <button className="mt-2 text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">
              검사 일정 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
