"use client";

import { useState } from "react";
import { upgradePlan } from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plan: string) => void;
  currentPlan?: "free" | "pro" | "max";
  targetPlan?: "pro" | "max";
  onSuccess?: () => void;
}

const planIcon: Record<string, IconName> = {
  free: "leaf",
  pro: "rocket",
  max: "building-2",
};

export default function PricingModal({
  isOpen,
  onClose,
  onSelect,
  currentPlan = "free",
  targetPlan,
  onSuccess,
}: PricingModalProps) {
  if (!isOpen) return null;
  return (
    <PricingModalContent
      onClose={onClose}
      onSelect={onSelect}
      currentPlan={currentPlan}
      targetPlan={targetPlan}
      onSuccess={onSuccess}
    />
  );
}

function PricingModalContent({
  onClose,
  onSelect,
  currentPlan = "free",
  targetPlan,
  onSuccess,
}: Omit<PricingModalProps, "isOpen">) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(targetPlan ?? null);
  const [completed, setCompleted] = useState(false);
  const [pgOpen, setPgOpen] = useState(false);
  const [pgProgress, setPgProgress] = useState(0);

  function getButtonState(planId: string): {
    label: string;
    disabled: boolean;
    style: string;
    message?: string;
  } {
    const disabledStyle = "border border-gray-300 text-gray-500 cursor-default";

    if (planId === currentPlan) {
      return { label: "현재 플랜", disabled: true, style: disabledStyle };
    }

    const planOrder = ["free", "pro", "max"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);

    if (targetIndex < currentIndex) {
      return { label: "현재 플랜 이하", disabled: true, style: disabledStyle };
    }

    if (currentPlan === "free" && planId === "max") {
      return {
        label: "Max 문의하기",
        disabled: true,
        style: "border border-gray-300 text-gray-400 cursor-not-allowed",
        message: "Pro 구매 후 이용 가능",
      };
    }

    if (currentPlan === "free" && planId === "pro") {
      return {
        label: "Pro 플랜 구매하기",
        disabled: false,
        style: "bg-primary-500 text-white shadow-button-primary hover:bg-primary-600 active:bg-primary-700",
      };
    }

    if (currentPlan === "pro" && planId === "max") {
      return {
        label: "Max 문의하기",
        disabled: false,
        style: "bg-gray-900 text-white hover:bg-gray-800",
      };
    }

    return { label: "현재 플랜", disabled: true, style: disabledStyle };
  }

  async function handleUpgrade(planId: string) {
    const buttonState = getButtonState(planId);
    if (buttonState.disabled) return;

    setLoading(true);
    setError(null);
    setSelectedPlan(planId);

    // PG 창 열기 → 프로그레스 채우며 자동 닫기
    setPgProgress(0);
    setPgOpen(true);

    await new Promise<void>((resolve) => {
      let prog = 0;
      const id = setInterval(() => {
        prog += 4;
        setPgProgress(Math.min(prog, 100));
        if (prog >= 100) {
          clearInterval(id);
          resolve();
        }
      }, 100);
    });

    setPgOpen(false);

    await new Promise((r) => setTimeout(r, 300));

    try {
      await upgradePlan(planId);
      setLoading(false);
      onSelect(planId);
      setCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setLoading(false);
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response: Response }).response;
        try {
          const body = await response.json();
          const msg = body?.error?.message || body?.message;
          if (response.status === 400) {
            setError(msg || "허용된 업그레이드 경로: Free→Pro, Pro→Max");
          } else if (response.status === 402) {
            setError(msg || "결제 처리에 실패했습니다. 다시 시도해주세요.");
          } else if (response.status === 403) {
            setError(msg || "이메일 인증이 필요하거나 권한이 없습니다.");
          } else {
            setError(msg || "업그레이드 처리 중 오류가 발생했습니다.");
          }
        } catch {
          setError("업그레이드 처리 중 오류가 발생했습니다.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      desc: "첫 번째 사이트를 무료로 만들어 보세요",
      priceLabel: "₩0",
      subLabel: "",
      features: ["AI 챗봇 기반 사이트 1개 생성", "기본 템플릿 3종", "AI 친화도 점수 (Tier 1)", "LLM 벤치마크 월 1회", "기본 모니터링 대시보드", "hezo.app 서브도메인"],
    },
    {
      id: "pro",
      name: "Pro",
      desc: "추가 사이트와 고급 분석 기능",
      priceLabel: billing === "monthly" ? "₩49,000" : "₩39,000",
      subLabel: billing === "monthly" ? "/ 월 (부가세 포함)" : "/ 월 (연간 결제, 부가세 포함)",
      highlighted: true,
      features: ["Free의 모든 기능 포함:", "추가 사이트 무제한 생성", "프리미엄 템플릿 15종", "Tier 2 경쟁사 대비 상대 평가", "LLM 벤치마크 주 1회", "커스텀 도메인 연결", "우선 기술 지원"],
    },
    {
      id: "max",
      name: "Max",
      desc: "대규모 운영, 전용 인프라",
      priceLabel: billing === "monthly" ? "₩190,000~" : "₩160,000~",
      subLabel: billing === "monthly" ? "/ 월 (부가세 포함)" : "/ 월 (연간 결제, 부가세 포함)",
      features: ["Pro의 모든 기능에 다음 포함:", "전용 VPC 인프라 (완전 격리)", "SLA 99.9% 가용성 보장", "Tier 3 외부 실측 + 실시간 알림", "전담 매니저 배정", "맞춤 API 연동 지원", "Shield Advanced 보안 옵션"],
    },
  ];

  if (pgOpen) {
    const planPrice: Record<string, string> = { pro: "₩49,000", max: "₩190,000" };
    const planName: Record<string, string> = { pro: "Pro", max: "Max" };
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* PG 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2v10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-700">Toss Payments</span>
            </div>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
              보안 결제
            </span>
          </div>

          {/* 결제 정보 */}
          <div className="px-5 py-5">
            <div className="mb-4 rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">결제 상품</p>
              <p className="mt-0.5 font-semibold text-gray-900">HEZO {planName[selectedPlan ?? ""] ?? selectedPlan} 플랜</p>
              <p className="mt-2 font-display text-2xl font-bold text-gray-900">
                {planPrice[selectedPlan ?? ""] ?? ""}
                <span className="ml-1 text-sm font-normal text-gray-400">/ 월</span>
              </p>
            </div>

            {/* 카드 입력 영역 (더미) */}
            <div className="mb-4 space-y-2.5">
              <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <Icon name="credit-card" size={14} className="mr-2 text-gray-400" />
                <span className="text-sm text-gray-300">카드 번호</span>
              </div>
              <div className="flex gap-2">
                <div className="flex h-10 flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                  <span className="text-sm text-gray-300">유효기간</span>
                </div>
                <div className="flex h-10 flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                  <span className="text-sm text-gray-300">CVC</span>
                </div>
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="overflow-hidden rounded-full bg-gray-100 h-1.5 mb-2">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-100"
                style={{ width: `${pgProgress}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-400">
              {pgProgress < 60 ? "결제 정보 확인 중..." : pgProgress < 90 ? "카드사 승인 요청 중..." : "결제 승인 완료 중..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const planLabel: Record<string, string> = { pro: "Pro", max: "Max" };
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-10 shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Icon name="check" size={28} className="text-green-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900">결제가 완료되었습니다</h2>
          <p className="mt-2 text-sm text-gray-500">
            {planLabel[selectedPlan ?? ""] ?? selectedPlan} 플랜이 적용되었습니다.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[90vw] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative px-8 pb-4 pt-8 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
          >
            <Icon name="x" size={20} />
          </button>
          <h2 className="font-display text-xl font-bold text-gray-900">추가 사이트를 만드시겠어요?</h2>
          <p className="mt-1 text-sm text-gray-500">
            더 많은 사이트와 고급 기능을 이용하려면 플랜을 업그레이드하세요.
          </p>

          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
            {([["monthly", "월간"], ["yearly", "연간"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setBilling(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  billing === key ? "bg-primary-500 text-white" : "text-gray-500",
                )}
              >
                {label}
                {key === "yearly" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      billing === "yearly" ? "bg-white/20 text-white" : "bg-primary-50 text-primary-700",
                    )}
                  >
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-8 mb-2 rounded-lg border border-error-200 bg-error-50 p-3">
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}

        <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto px-8 pb-8 pt-4 md:max-h-none md:grid-cols-3 md:overflow-visible">
          {plans.map((plan) => {
            const buttonState = getButtonState(plan.id);
            const isLoadingThis = loading && selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-xl border p-6",
                  plan.highlighted ? "border-primary-300 bg-primary-50/30 shadow-sm" : "border-gray-200",
                )}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Icon name={planIcon[plan.id]} size={18} className="text-primary-600" />
                </div>

                <h3 className="font-display text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{plan.desc}</p>

                <div className="mb-4 mt-4">
                  <span className="font-display text-2xl font-bold text-gray-900">{plan.priceLabel}</span>
                  {plan.subLabel && <span className="ml-1 text-xs text-gray-400">{plan.subLabel}</span>}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={buttonState.disabled || loading}
                  className={cn(
                    "w-full rounded-md py-2.5 text-sm font-semibold transition-colors",
                    buttonState.style,
                    loading && !isLoadingThis ? "opacity-50" : "",
                  )}
                >
                  {isLoadingThis ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    buttonState.label
                  )}
                </button>

                {buttonState.message && (
                  <p className="mt-1.5 text-center text-xs text-warning-600">{buttonState.message}</p>
                )}

                <ul className="mt-5 flex flex-1 flex-col gap-2">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      {feat.endsWith(":") ? (
                        <span className="font-semibold text-gray-700">{feat}</span>
                      ) : (
                        <>
                          <span className="mt-0.5 flex-none">
                            <Icon name="check" size={14} className="text-primary-600" />
                          </span>
                          <span>{feat}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
