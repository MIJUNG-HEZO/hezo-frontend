import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

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
const totalVisitors = dailyTraffic.reduce((s, d) => s + d.total, 0);
const totalLLM = dailyTraffic.reduce((s, d) => s + d.llm, 0);
const totalOrganic = dailyTraffic.reduce((s, d) => s + d.organic, 0);

const summary: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  sub?: string;
  icon: IconName;
  tint: string;
}[] = [
  { label: "총 방문자 (주간)", value: totalVisitors.toLocaleString(), delta: "18.6% 전주 대비", icon: "users", tint: "bg-primary-50 text-primary-600" },
  { label: "신규 문의 · 예약", value: "23", delta: "15.0% 전주 대비", icon: "clipboard-list", tint: "bg-warning-50 text-warning-600" },
  { label: "사이트 가동률", value: "99.9", suffix: "%", sub: "최근 30일 기준", icon: "circle-check-big", tint: "bg-success-50 text-success-600" },
  { label: "방문자 회원", value: "412", delta: "24명 전주 대비", icon: "user", tint: "bg-primary-50 text-primary-600" },
];

const contactRows: [string, IconName, number][] = [
  ["전화 문의", "phone", 8],
  ["온라인 예약", "calendar", 10],
  ["채팅 문의", "message-circle", 5],
];

const statusRows: [string, string][] = [
  ["사이트 가동률", "99.9%"],
  ["SSL 인증서", "정상"],
  ["평균 응답 시간", "0.8초"],
  ["최근 백업", "7시간 전"],
  ["CDN 상태", "정상"],
];

export default function OperationsPage() {
  return (
    <>
      <TopBar
        title="운영 지표 대시보드"
        subtitle="사이트 트래픽, 문의, 가동률 등 운영 현황을 한눈에 확인합니다."
      >
        <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <Icon name="calendar" size={16} className="text-gray-500" /> 2025.07.15 – 07.21
        </button>
      </TopBar>

      <div className="flex flex-col gap-6 p-8">
        {/* 요약 4 카드 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <Card key={s.label} padding={20}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", s.tint)}>
                  <Icon name={s.icon} size={16} />
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display text-3xl font-bold tracking-[-0.02em] text-gray-900">{s.value}</span>
                {s.suffix && <span className="text-lg text-gray-400">{s.suffix}</span>}
              </div>
              {s.delta && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success-600">
                  <Icon name="trending-up" size={13} /> {s.delta}
                </p>
              )}
              {s.sub && <p className="mt-1 text-xs text-gray-400">{s.sub}</p>}
            </Card>
          ))}
        </div>

        {/* 트래픽 구분 + 일별 차트 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">트래픽 구분</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">LLM 유입</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {totalLLM}회 ({Math.round((totalLLM / totalVisitors) * 100)}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${(totalLLM / totalVisitors) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">오가닉 유입</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {totalOrganic}회 ({Math.round((totalOrganic / totalVisitors) * 100)}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gray-300" style={{ width: `${(totalOrganic / totalVisitors) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">LLM 유입 비율이 증가하고 있습니다.</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success-600">
                <Icon name="trending-up" size={13} /> LLM 비율 +3.2%p 전주 대비
              </p>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm font-semibold text-gray-700">일별 트래픽 추이</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-primary-400" /> LLM
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-gray-300" /> 오가닉
                </span>
              </div>
            </div>
            <div className="flex h-44 items-end justify-between gap-2">
              {dailyTraffic.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-600">{d.total}</span>
                  <div
                    className="flex w-8 flex-col overflow-hidden rounded-t md:w-10"
                    style={{ height: `${(d.total / maxTraffic) * 140}px` }}
                  >
                    <div className="w-full bg-primary-400" style={{ height: `${(d.llm / d.total) * 100}%` }} />
                    <div className="w-full flex-1 bg-gray-300" />
                  </div>
                  <span className="mt-1 text-[10px] text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 하단 3 카드 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">신규 문의 · 예약 현황</h3>
            <div className="flex flex-col gap-3">
              {contactRows.map(([t, ic, n]) => (
                <div key={t} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon name={ic} size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{t}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{n}건</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">총 23건 · 응답 대기 3건</p>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">사이트 상태</h3>
            <div className="flex flex-col gap-4">
              {statusRows.map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{l}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{v}</span>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-50">
                      <Icon name="check" size={13} className="text-success-600" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">방문자 회원 현황</h3>
            <div className="mb-4">
              <span className="text-xs text-gray-400">총 회원 수</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold tracking-[-0.02em] text-gray-900">412</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-600">
                  <Icon name="trending-up" size={14} /> 24명
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[["신규 가입 (이번 주)", "24명"], ["재방문율", "68%"], ["평균 체류 시간", "3분 42초"]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-500">{l}</span>
                  <span className="text-xs font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-16 items-end gap-1">
              {[20, 30, 35, 40, 55, 65, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary-100" style={{ height: `${h}%` }} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
