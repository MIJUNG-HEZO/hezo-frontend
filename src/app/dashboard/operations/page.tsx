"use client";

export default function OperationsDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">운영 지표 대시보드</h2>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* 인프라 건강성 */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-700 mb-3">인프라 건강성</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>CPU</span>
              <span className="text-green-600">32%</span>
            </div>
            <div className="flex justify-between">
              <span>메모리</span>
              <span className="text-green-600">58%</span>
            </div>
            <div className="flex justify-between">
              <span>디스크</span>
              <span className="text-green-600">24%</span>
            </div>
            <div className="flex justify-between">
              <span>응답 시간</span>
              <span className="text-green-600">0.8s</span>
            </div>
          </div>
        </div>

        {/* 파이프라인 운영 */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-700 mb-3">파이프라인 운영</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>성공률</span>
              <span className="text-green-600">98.5%</span>
            </div>
            <div className="flex justify-between">
              <span>평균 처리 시간</span>
              <span>142초</span>
            </div>
            <div className="flex justify-between">
              <span>재시도 횟수</span>
              <span>2건</span>
            </div>
          </div>
        </div>

        {/* 비즈니스 성과 */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-700 mb-3">비즈니스 성과</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>오늘 사이트 생성</span>
              <span className="font-bold">3건</span>
            </div>
            <div className="flex justify-between">
              <span>활성 고객 비율</span>
              <span>72%</span>
            </div>
            <div className="flex justify-between">
              <span>평균 메트릭 점수</span>
              <span>76점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
