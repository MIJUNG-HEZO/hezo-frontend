"use client";

import { useState } from "react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plan: string) => void;
}

export default function PricingModal({ isOpen, onClose, onSelect }: PricingModalProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  if (!isOpen) return null;

  const plans = [
    {
      id: "starter",
      name: "Starter",
      desc: "첫 번째 사이트를 무료로 만들어 보세요",
      price: { monthly: 0, yearly: 0 },
      priceLabel: "₩0",
      subLabel: "",
      cta: "현재 플랜",
      ctaStyle: "border border-gray-300 text-gray-500 cursor-default",
      disabled: true,
      features: [
        "AI 챗봇 기반 사이트 1개 생성",
        "기본 템플릿 3종",
        "AI 친화도 점수 (Tier 1)",
        "LLM 벤치마크 월 1회",
        "기본 모니터링 대시보드",
        "hezo.app 서브도메인",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      desc: "추가 사이트와 고급 분석 기능",
      price: { monthly: 49000, yearly: 39000 },
      priceLabel: billing === "monthly" ? "₩49,000" : "₩39,000",
      subLabel: billing === "monthly" ? "/ 월 (부가세 포함)" : "/ 월 (연간 결제, 부가세 포함)",
      cta: "Pro 플랜 구매하기",
      ctaStyle: "bg-green-600 text-white hover:bg-green-700",
      disabled: false,
      highlighted: true,
      features: [
        "Starter의 모든 기능 포함:",
        "추가 사이트 무제한 생성",
        "프리미엄 템플릿 15종",
        "Tier 2 경쟁사 대비 상대 평가",
        "LLM 벤치마크 주 1회",
        "커스텀 도메인 연결",
        "우선 기술 지원",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      desc: "대규모 운영, 전용 인프라",
      price: { monthly: 190000, yearly: 160000 },
      priceLabel: billing === "monthly" ? "₩190,000~" : "₩160,000~",
      subLabel: billing === "monthly" ? "/ 월 (부가세 포함)" : "/ 월 (연간 결제, 부가세 포함)",
      cta: "Enterprise 문의하기",
      ctaStyle: "bg-gray-900 text-white hover:bg-gray-800",
      disabled: false,
      features: [
        "Pro의 모든 기능에 다음 포함:",
        "전용 VPC 인프라 (완전 격리)",
        "SLA 99.9% 가용성 보장",
        "Tier 3 외부 실측 + 실시간 알림",
        "전담 매니저 배정",
        "맞춤 API 연동 지원",
        "Shield Advanced 보안 옵션",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[90vw] max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="text-center pt-8 pb-4 px-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
          <h2 className="text-xl font-bold text-gray-900">추가 사이트를 만드시겠어요?</h2>
          <p className="text-sm text-gray-500 mt-1">더 많은 사이트와 고급 기능을 이용하려면 플랜을 업그레이드하세요.</p>

          {/* 월간/연간 토글 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm ${billing === "monthly" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              월간
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 ${billing === "yearly" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              연간 <span className="text-[10px] text-green-500 font-medium">-17% 절약</span>
            </button>
          </div>
        </div>

        {/* 플랜 카드 3개 */}
        <div className="grid grid-cols-3 gap-4 px-8 pb-8 pt-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlighted ? "border-green-300 bg-green-50/30 shadow-sm" : "border-gray-200"
              }`}
            >
              {/* 플랜 아이콘 */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg mb-4">
                {plan.id === "starter" && "🌱"}
                {plan.id === "pro" && "🚀"}
                {plan.id === "enterprise" && "🏢"}
              </div>

              {/* 플랜명 */}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>

              {/* 가격 */}
              <div className="mt-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">{plan.priceLabel}</span>
                {plan.subLabel && <span className="text-xs text-gray-400 ml-1">{plan.subLabel}</span>}
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={() => !plan.disabled && onSelect(plan.id)}
                disabled={plan.disabled}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>

              {/* 기능 목록 */}
              <ul className="mt-5 space-y-2 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    {feat.endsWith(":") ? (
                      <span className="font-medium text-gray-700">{feat}</span>
                    ) : (
                      <>
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feat}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
