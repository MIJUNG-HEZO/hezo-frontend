"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "./Section";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants, type ButtonHierarchy } from "@/components/ui/button-variants";
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
  hierarchy: ButtonHierarchy;
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
    hierarchy: "secondary",
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
    hierarchy: "primary",
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
    hierarchy: "secondary",
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <Section id="pricing" className="border-y border-gray-200 bg-gray-50 py-24">
      <div className="mx-auto mb-10 max-w-[680px] text-center">
        <Badge color="brand">요금제</Badge>
        <h2
          className={`mb-3.5 mt-4 font-display text-[38px] font-bold tracking-[-0.02em] text-gray-900 ${kr}`}
        >
          무료로 시작하고, 필요할 때 확장하세요
        </h2>
        <p className={`text-lg text-gray-500 ${kr}`}>
          첫 사이트는 평생 무료입니다. 더 많은 사이트와 고급 분석이 필요해지면 언제든
          업그레이드하세요.
        </p>
      </div>

      {/* billing toggle */}
      <div className="mb-11 flex justify-center">
        <div className="inline-flex gap-1 rounded-full border border-gray-200 bg-white p-1">
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
                billing === key ? "bg-primary-500 text-white" : "text-gray-500",
              )}
            >
              {label}
              {key === "yearly" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                    billing === "yearly"
                      ? "bg-white/20 text-white"
                      : "bg-primary-50 text-primary-700",
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
              "relative rounded-2xl bg-white p-[30px]",
              p.highlighted
                ? "-mt-2 border-2 border-primary-500 shadow-xl"
                : "border border-gray-200 shadow-xs",
            )}
          >
            {p.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="brand" size="md">
                  가장 인기
                </Badge>
              </div>
            )}
            <h3 className="font-display text-[22px] font-bold text-gray-900">{p.name}</h3>
            <p className={`mb-5 mt-1.5 min-h-10 text-sm text-gray-500 ${kr}`}>{p.desc}</p>
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-bold tracking-[-0.02em] text-gray-900">
                {p.price[billing]}
              </span>
              {p.id !== "free" && (
                <span className="text-sm font-medium text-gray-400">{p.sub}</span>
              )}
            </div>
            <div className="mb-[22px] min-h-[18px] text-[13px] text-gray-400">
              {p.id === "free"
                ? p.sub
                : billing === "yearly"
                  ? "연간 결제 시 월 환산 금액"
                  : ""}
            </div>
            <Link
              href="/auth/login"
              className={buttonVariants({
                hierarchy: p.hierarchy,
                size: "lg",
                className: "w-full",
              })}
            >
              {p.cta}
            </Link>
            <div className="my-6 h-px bg-gray-200" />
            <ul className="flex flex-col gap-3">
              {p.features.map((f, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 text-sm [word-break:keep-all]",
                    i === 0 ? "font-semibold text-gray-700" : "text-gray-500",
                  )}
                >
                  <span className="mt-px flex-none">
                    <Icon name="check" size={17} className="text-primary-600" />
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
