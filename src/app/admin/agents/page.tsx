"use client";

const AGENTS = [
  {
    id: "generation",
    name: "P4 생성 에이전트",
    runtime: "hezo_generation_agent-GPmRKmCFnL",
    status: "READY",
  },
  {
    id: "validation",
    name: "P4 검증 에이전트",
    runtime: "hezo_validation_agent-0b91p74jvm",
    status: "READY",
  },
  {
    id: "report",
    name: "P4 리포트 에이전트",
    runtime: "hezo_report_agent-*",
    status: "미배포",
  },
  {
    id: "chat",
    name: "P1 챗봇 에이전트",
    runtime: "미배포",
    status: "미배포",
  },
];

const STATUS_COLOR: Record<string, string> = {
  READY:  "bg-green-100 text-green-700",
  미배포: "bg-gray-100 text-gray-500",
};

export default function AdminAgentsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-xl font-bold text-gray-900">에이전트 상태</h1>
      <p className="mb-6 text-sm text-gray-500">
        CloudWatch 메트릭(토큰·비용·호출·에러)은 P5 모니터링 스펙 확정 후 연동 예정입니다.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENTS.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{a.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[a.status] ?? "bg-gray-100 text-gray-500"}`}
              >
                {a.status}
              </span>
            </div>
            <div className="font-mono text-xs text-gray-400">{a.runtime}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <div className="mb-2 text-sm font-medium text-gray-600">
          토큰 · 비용 · 호출 · 에러율
        </div>
        <div className="text-xs text-gray-400">
          P5 모니터링 스펙 확정 후 CloudWatch 데이터가 여기 표시됩니다.
        </div>
      </div>
    </div>
  );
}
