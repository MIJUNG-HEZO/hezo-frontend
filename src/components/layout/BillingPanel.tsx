"use client";

import { useEffect, useRef, useState } from "react";
import { getSubscriptionStatus } from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types";

interface BillingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (targetPlan: string) => void;
}

const PLAN_DISPLAY: Record<string, { name: string; icon: IconName; tint: string }> = {
  starter: { name: "Starter", icon: "leaf", tint: "text-gray-600" },
  pro: { name: "Pro", icon: "rocket", tint: "text-primary-600" },
  enterprise: { name: "Enterprise", icon: "building-2", tint: "text-blue-600" },
};

function UpgradeButton({
  plan,
  label,
  price,
  icon,
  tone,
  onClick,
}: {
  plan: string;
  label: string;
  price: string;
  icon: IconName;
  tone: "primary" | "blue";
  onClick: (p: string) => void;
}) {
  const tones =
    tone === "primary"
      ? "border-primary-200 bg-primary-50 hover:bg-primary-100"
      : "border-blue-200 bg-blue-50 hover:bg-blue-100";
  const fg = tone === "primary" ? "text-primary-700" : "text-blue-700";
  const sub = tone === "primary" ? "text-primary-600" : "text-blue-600";
  const arrow = tone === "primary" ? "text-primary-500" : "text-blue-500";
  return (
    <button
      onClick={() => onClick(plan)}
      className={cn("flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors", tones)}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} size={18} className={fg} />
        <div className="text-left">
          <p className={cn("text-sm font-semibold", fg)}>{label}</p>
          <p className={cn("text-xs", sub)}>{price}</p>
        </div>
      </div>
      <Icon name="arrow-right" size={16} className={arrow} />
    </button>
  );
}

export default function BillingPanel({ isOpen, onClose, onUpgrade }: BillingPanelProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
    } catch {
      setError("구독 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      fetchStatus();
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const planInfo = status ? PLAN_DISPLAY[status.plan] : null;

  return (
    <div className="fixed inset-0 z-[90] flex">
      <div className="absolute inset-0 bg-[var(--surface-overlay)]" onClick={onClose} />

      <div className="relative ml-auto flex h-full w-80 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-gray-900">결제 및 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="mb-3 text-sm text-error-500">{error}</p>
              <Button hierarchy="secondary" size="sm" onClick={fetchStatus}>재시도</Button>
            </div>
          )}

          {status && planInfo && !loading && !error && (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Icon name={planInfo.icon} size={18} className={planInfo.tint} />
                  <span className={cn("text-base font-bold", planInfo.tint)}>{planInfo.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {status.sites_used}/{status.sites_limit} 사이트 사용 중
                </p>
                {status.plan_updated_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    마지막 변경: {new Date(status.plan_updated_at).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>

              {status.can_upgrade && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase text-gray-500">플랜 업그레이드</p>

                  {status.plan === "starter" && (
                    <>
                      <UpgradeButton
                        plan="pro"
                        label="Pro"
                        price="₩49,000/월 · 2사이트"
                        icon="rocket"
                        tone="primary"
                        onClick={onUpgrade}
                      />
                      <UpgradeButton
                        plan="enterprise"
                        label="Enterprise"
                        price="₩190,000~/월 · 5사이트"
                        icon="building-2"
                        tone="blue"
                        onClick={onUpgrade}
                      />
                    </>
                  )}

                  {status.plan === "pro" && (
                    <UpgradeButton
                      plan="enterprise"
                      label="Enterprise"
                      price="₩190,000~/월 · 5사이트"
                      icon="building-2"
                      tone="blue"
                      onClick={onUpgrade}
                    />
                  )}
                </div>
              )}

              {!status.can_upgrade && (
                <div className="rounded-xl bg-primary-50 p-4 text-center">
                  <p className="text-sm font-medium text-primary-700">최상위 플랜을 이용 중입니다</p>
                  <p className="mt-1 text-xs text-primary-600">
                    추가 문의는 support@hezo.io로 연락해주세요
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
