"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "./Section";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

type Plan = {
  id: string;
  name: string;
  desc: string;
  price: { monthly: string; yearly: string };
  sub: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    desc: "첫 번째 사이트를 무료로 만들어 보세요",
    price: { monthly: "₩0", yearly: "₩0" },
    sub: "평생 무료",
    features: [
      "AI 챗봇 기반 사이트 1개 생성",
      "기본 템플릿 3종",
      "AI 친화도 점수 (Tier 1)",
      "LLM 벤치마크 월 1회",
      "기본 모니터링 대시보드",
      "hezo.app 서브도메인",
    ],
    cta: "무료로 시작하기",
  },
  {
    id: "pro",
    name: "Pro",
    desc: "추가 사이트와 고급 분석 기능",
    highlighted: true,
    price: { monthly: "₩49,000", yearly: "₩39,000" },
    sub: "/ 월 · 부가세 포함",
    features: [
      "Free의 모든 기능 포함",
      "추가 사이트 무제한 생성",
      "프리미엄 템플릿 15종",
      "Tier 2 경쟁사 대비 상대 평가",
      "LLM 벤치마크 주 1회",
      "커스텀 도메인 연결",
      "우선 기술 지원",
    ],
    cta: "Pro 시작하기",
  },
  {
    id: "max",
    name: "Max",
    desc: "대규모 운영, 전용 인프라",
    price: { monthly: "₩190,000~", yearly: "₩160,000~" },
    sub: "/ 월 · 부가세 포함",
    features: [
      "Pro의 모든 기능 포함",
      "전용 VPC 인프라 (완전 격리)",
      "SLA 99.9% 가용성 보장",
      "Tier 3 외부 실측 + 실시간 알림",
      "전담 매니저 배정",
      "맞춤 API 연동 지원",
    ],
    cta: "도입 문의하기",
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <Section id="pricing" className="py-24">
      <div className="mx-auto mb-10 max-w-[680px] text-center">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">
          요금제
        </span>
        <h2
          className={`mb-3.5 mt-3 font-display text-[42px] font-bold tracking-[-0.04em] text-gray-900 ${kr}`}
        >
          무료로 시작하고, 필요할 때 확장하세요
        </h2>
        <p className={`text-lg text-gray-500 ${kr}`}>
          첫 사이트는 평생 무료입니다. 더 많은 사이트와 고급 분석이 필요해지면 언제든
          업그레이드하세요.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-11 flex justify-center">
        <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1">
          {(
            [
              ["monthly", "월간 결제"],
              ["yearly", "연간 결제"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBilling(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-[18px] py-2 text-sm font-semibold transition-colors",
                billing === key
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {label}
              {key === "yearly" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                    billing === "yearly"
                      ? "bg-primary-50 text-primary-700"
                      : "bg-primary-500/10 text-primary-600",
                  )}
                >
                  -17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 items-start gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative rounded-2xl p-[30px]",
              p.highlighted
                ? "-mt-2 bg-surface-dark"
                : "border border-gray-200 bg-white",
            )}
          >
            {p.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                  가장 인기
                </span>
              </div>
            )}

            <h3
              className={cn(
                "font-display text-[22px] font-bold",
                p.highlighted ? "text-white" : "text-gray-900",
              )}
            >
              {p.name}
            </h3>
            <p
              className={cn(
                `mb-5 mt-1.5 min-h-10 text-sm ${kr}`,
                p.highlighted ? "text-white/50" : "text-gray-500",
              )}
            >
              {p.desc}
            </p>

            <div className="mb-1 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "font-display text-[40px] font-bold tracking-[-0.02em]",
                  p.highlighted ? "text-white" : "text-gray-900",
                )}
              >
                {p.price[billing]}
              </span>
              {p.id !== "free" && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    p.highlighted ? "text-white/55" : "text-gray-400",
                  )}
                >
                  {p.sub}
                </span>
              )}
            </div>

            <div
              className={cn(
                "mb-[22px] min-h-[18px] text-[13px]",
                p.highlighted ? "text-white/50" : "text-gray-400",
              )}
            >
              {p.id === "free"
                ? p.sub
                : billing === "yearly"
                  ? "연간 결제 시 월 환산 금액"
                  : ""}
            </div>

            <Link
              href="/auth/login"
              className={cn(
                "inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors",
                p.highlighted
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50",
              )}
            >
              {p.cta}
            </Link>

            <div
              className={cn(
                "my-6 h-px",
                p.highlighted ? "bg-white/10" : "bg-gray-100",
              )}
            />

            <ul className="flex flex-col gap-3">
              {p.features.map((f, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 text-sm [word-break:keep-all]",
                    p.highlighted
                      ? i === 0
                        ? "font-semibold text-white/90"
                        : "text-white/55"
                      : i === 0
                        ? "font-semibold text-gray-800"
                        : "text-gray-500",
                  )}
                >
                  <span className="mt-px flex-none">
                    <Icon name="check" size={17} className="text-primary-500" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
