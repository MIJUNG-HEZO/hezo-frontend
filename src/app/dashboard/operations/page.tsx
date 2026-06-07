"use client";

export default function OperationsDashboard() {
  // Mock data
  const dailyTraffic = [
    { day: "월", total: 180, llm: 32, organic: 148 },
    { day: "화", total: 210, llm: 45, organic: 165 },
    { day: "수", total: 195, llm: 38, organic: 157 },
    { day: "목", total: 240, llm: 52, organic: 188 },
    { day: "금", total: 260, llm: 58, organic: 202 },
    { day: "토", total: 150, llm: 22, organic: 128 },
    { day: "일", total: 130, llm: 18, organic: 112 },
  ];
  const maxTraffic = Math.max(...dailyTraffic.map((d) => d.total));
  const totalVisitors = dailyTraffic.reduce((sum, d) => sum + d.total, 0);
  const totalLLM = dailyTraffic.reduce((sum, d) => sum + d.llm, 0);
  const totalOrganic = dailyTraffic.reduce((sum, d) => sum + d.organic, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">운영 지표 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">사이트 트래픽, 문의, 가동률 등 운영 현황을 한눈에 확인합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <span>📅</span>
            <span>2025.07.15 ~ 2025.07.21</span>
            <span>▾</span>
          </button>
        </div>
      </div>

      {/* 상단 4 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 방문자 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">총 방문자 (주간)</span>
            <span className="text-green-500 text-lg">👥</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{totalVisitors.toLocaleString()}</span>
          </div>
          <p className="text-xs text-green-600 mt-1">↑ 18.6% 전주 대비</p>
        </div>

        {/* 신규 문의/예약 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">신규 문의 · 예약</span>
            <span className="text-yellow-500 text-lg">📋</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">23</span>
          </div>
          <p className="text-xs text-green-600 mt-1">↑ 15.0% 전주 대비</p>
        </div>

        {/* 사이트 가동률 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">사이트 가동률</span>
            <span className="text-green-500 text-lg">✅</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">99.9</span>
            <span className="text-lg text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">최근 30일 기준</p>
        </div>

        {/* 방문자 회원 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">방문자 회원</span>
            <span className="text-blue-500 text-lg">🧑‍💼</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">412</span>
          </div>
          <p className="text-xs text-green-600 mt-1">↑ 24명 전주 대비</p>
        </div>
      </div>

      {/* 트래픽 오버뷰 + 바 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 트래픽 분할 카드 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">트래픽 구분</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">LLM 유입</span>
                <span className="text-xs font-medium text-gray-900">{totalLLM}회 ({Math.round((totalLLM / totalVisitors) * 100)}%)</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(totalLLM / totalVisitors) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">오가닉 유입</span>
                <span className="text-xs font-medium text-gray-900">{totalOrganic}회 ({Math.round((totalOrganic / totalVisitors) * 100)}%)</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(totalOrganic / totalVisitors) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">LLM 유입 비율이 증가하고 있습니다.</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ LLM 비율 +3.2%p 전주 대비</p>
          </div>
        </div>

        {/* 일별 트래픽 바 차트 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h3 className="text-sm font-medium text-gray-700">일별 트래픽 추이</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-400 rounded-sm inline-block" /> LLM
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-400 rounded-sm inline-block" /> 오가닉
              </span>
            </div>
          </div>
          <div className="h-44 flex items-end justify-between gap-2">
            {dailyTraffic.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-gray-600">{d.total}</span>
                <div className="w-full flex flex-col items-center">
                  {/* Stacked bar */}
                  <div
                    className="w-8 md:w-10 flex flex-col rounded-t overflow-hidden"
                    style={{ height: `${(d.total / maxTraffic) * 140}px` }}
                  >
                    <div
                      className="w-full bg-green-400"
                      style={{ height: `${(d.llm / d.total) * 100}%` }}
                    />
                    <div
                      className="w-full bg-blue-400 flex-1"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 신규 문의/예약 상세 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">신규 문의 · 예약 현황</h3>
          <div className="space-y-3">
            {[
              { type: "전화 문의", count: 8, icon: "📞" },
              { type: "온라인 예약", count: 10, icon: "📅" },
              { type: "채팅 문의", count: 5, icon: "💬" },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm text-gray-600">{item.type}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}건</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">총 23건 · 응답 대기 3건</p>
          </div>
        </div>

        {/* 사이트 가동 상태 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">사이트 상태</h3>
          <div className="space-y-4">
            {[
              { label: "사이트 가동률", value: "99.9%", ok: true },
              { label: "SSL 인증서", value: "정상", ok: true },
              { label: "평균 응답 시간", value: "0.8초", ok: true },
              { label: "최근 백업", value: "7시간 전", ok: true },
              { label: "CDN 상태", value: "정상", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    item.ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}>
                    {item.ok ? "✓" : "!"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 방문자 회원 */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">방문자 회원 현황</h3>
          <div className="mb-4">
            <span className="text-xs text-gray-400">총 회원 수</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-gray-900">412</span>
              <span className="text-sm text-green-600 ml-2">↑ 24명</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "신규 가입 (이번 주)", value: "24명" },
              { label: "재방문율", value: "68%" },
              { label: "평균 체류 시간", value: "3분 42초" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-xs font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
          {/* 미니 그래프 */}
          <div className="mt-4 h-16 flex items-end gap-1">
            {[20, 30, 35, 40, 55, 65, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
          </div>
        </div>
      </div>
    </div>
  );
}
