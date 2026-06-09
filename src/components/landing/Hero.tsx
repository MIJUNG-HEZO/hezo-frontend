import Link from "next/link";
import { Section } from "./Section";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/button-variants";

// Korean line-breaking: keep words intact, prefer balanced wraps.
const kr = "[word-break:keep-all] [text-wrap:pretty]";

export function Hero() {
  return (
    <Section className="pb-16 pt-[72px]">
      <div className="flex flex-col items-center gap-[22px] text-center">
        <Badge color="brand" size="lg" dot>
          AI 검색 최적화 · GEO
        </Badge>
        <h1
          className={`max-w-[760px] font-display text-[56px] font-bold leading-[1.14] tracking-[-0.025em] text-gray-900 ${kr}`}
        >
          손님이 ChatGPT에게 물으면, 우리 가게가 나옵니다
        </h1>
        <p className={`max-w-[640px] text-[19px] leading-[1.55] text-gray-500 ${kr}`}>
          이제 고객은 검색창이 아니라 AI에게 묻습니다. HEZO는 ChatGPT·Perplexity 같은
          AI가 당신의 가게를 찾고 추천하도록, 검색에 최적화된 홈페이지를 자동으로 만들어
          드립니다.
        </p>
        <div className="mt-1.5 flex gap-3">
          <a href="#how" className={buttonVariants({ hierarchy: "secondary", size: "xl" })}>
            <Icon name="play" size={18} className="text-gray-700" />
            작동 방식 보기
          </a>
          <Link
            href="/auth/login"
            className={buttonVariants({ hierarchy: "primary", size: "xl" })}
          >
            무료로 시작하기
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[13.5px] text-gray-400">
          <Icon name="check" size={15} className="text-success-600" />
          신용카드 없이 시작 · 첫 사이트 무료
        </div>
        <div className="mt-11 w-full">
          <HeroMockup />
        </div>
      </div>
    </Section>
  );
}

const services: { label: string; icon: "leaf" | "flask-conical" | "syringe" | "car" }[] = [
  { label: "추나요법", icon: "leaf" },
  { label: "체질 한약", icon: "flask-conical" },
  { label: "침·약침", icon: "syringe" },
  { label: "교통사고 클리닉", icon: "car" },
];

const scoreBars: [string, number][] = [
  ["구조화 데이터", 0.95],
  ["시맨틱 HTML", 0.88],
  ["FAQ 스키마", 0.74],
];

function HeroMockup() {
  const r = 36;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative mx-auto w-full max-w-[940px] pb-14">
      {/* Browser window — the generated customer site */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* chrome bar */}
        <div className="flex h-11 items-center gap-3.5 border-b border-gray-200 bg-gray-50 px-4">
          <div className="flex gap-[7px]">
            <span className="h-[11px] w-[11px] rounded-full bg-error-400" />
            <span className="h-[11px] w-[11px] rounded-full bg-warning-400" />
            <span className="h-[11px] w-[11px] rounded-full bg-success-400" />
          </div>
          <div className="flex flex-1 justify-center">
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-medium text-gray-500">
              <Icon name="lock" size={12} className="text-success-600" />
              barun-hani.hezo.app
            </div>
          </div>
          <div className="w-13" />
        </div>

        {/* generated site body */}
        <div>
          {/* site nav */}
          <div className="flex items-center justify-between border-b border-gray-100 px-7 py-4">
            <span className="font-display text-[17px] font-bold text-gray-900">바른한의원</span>
            <div className="flex gap-[18px]">
              {["진료안내", "의료진", "오시는 길", "예약"].map((n, i) => (
                <span
                  key={n}
                  className={`text-[12.5px] font-medium ${i === 3 ? "text-primary-600" : "text-gray-500"}`}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* site hero */}
          <div className="bg-[linear-gradient(160deg,var(--color-primary-50),#fff_70%)] px-7 pb-[26px] pt-[34px]">
            <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-white px-2.5 py-1">
              <Icon name="badge-check" size={13} className="text-primary-600" />
              <span className="text-[11px] font-semibold text-primary-700">AI 최적화 적용됨</span>
            </div>
            <div
              className={`max-w-[420px] font-display text-[26px] font-bold leading-[1.25] tracking-[-0.02em] text-gray-900 ${kr}`}
            >
              정직한 진료로 17년, 동네 주민이 믿고 찾는 한의원
            </div>
            <div className={`mt-2.5 max-w-[380px] text-[13px] text-gray-500 ${kr}`}>
              체질에 맞는 맞춤 한약과 추나요법으로 통증의 원인부터 바로잡습니다.
            </div>
            <div className="mt-[18px] flex gap-2">
              <span className="rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-white">
                온라인 예약
              </span>
              <span className="rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700">
                전화 상담
              </span>
            </div>
          </div>

          {/* service cards */}
          <div className="grid grid-cols-4 gap-2.5 px-7 pb-[30px] pt-5">
            {services.map((s) => (
              <div key={s.label} className="rounded-lg border border-gray-200 px-3 py-3.5">
                <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-sm bg-primary-50">
                  <Icon name={s.icon} size={15} className="text-primary-600" />
                </div>
                <div className="text-[12.5px] font-semibold text-gray-800">{s.label}</div>
                <div className="mt-2 h-[5px] w-[70%] rounded-[3px] bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating: AI 친화도 점수 card */}
      <div className="absolute -right-2 bottom-0 w-[268px] rounded-2xl border border-gray-200 bg-white p-[18px] shadow-2xl">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-gray-500">AI 친화도 점수</span>
          <Badge color="success" size="sm" dot>
            실시간
          </Badge>
        </div>
        <div className="flex items-end gap-3.5">
          <div className="relative h-[84px] w-[84px] flex-none">
            <svg width="84" height="84" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-gray-100)" strokeWidth="9" />
              <circle
                cx="42"
                cy="42"
                r={r}
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - 0.82)}
                transform="rotate(-90 42 42)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold leading-none text-gray-900">82</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[9px]">
            {scoreBars.map(([label, v]) => (
              <div key={label}>
                <div className="mb-[3px] text-[10.5px] text-gray-500">{label}</div>
                <div className="h-[5px] overflow-hidden rounded-[3px] bg-gray-100">
                  <div
                    className="h-full rounded-[3px] bg-primary-500"
                    style={{ width: `${v * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating: LLM citation chip */}
      <div className="absolute -left-2.5 top-24 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-xl">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-primary-50">
          <Icon name="quote" size={15} className="text-primary-600" />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-900">ChatGPT가 인용함</div>
          <div className="text-[10.5px] text-gray-500">&ldquo;강남 추나요법 한의원 추천&rdquo;</div>
        </div>
      </div>
    </div>
  );
}
