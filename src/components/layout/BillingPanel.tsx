"use client";

import { useEffect, useRef, useState } from "react";
import { getSubscriptionStatus } from "@/lib/api";
import type { SubscriptionStatus } from "@/types";

interface BillingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (targetPlan: string) => void;
}

const PLAN_DISPLAY: Record<string, { name: string; icon: string; color: string }> = {
  starter: { name: "Starter", icon: "🌱", color: "text-gray-600" },
  pro: { name: "Pro", icon: "🚀", color: "text-green-600" },
  enterprise: { name: "Enterprise", icon: "🏢", color: "text-purple-600" },
};

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
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* 패널 */}
      <div className="relative ml-auto w-80 h-full bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">결제 및 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <button
                onClick={fetchStatus}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                재시도
              </button>
            </div>
          )}

          {status && planInfo && !loading && !error && (
            <div className="space-y-6">
              {/* 현재 플랜 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{planInfo.icon}</span>
                  <span className={`text-base font-bold ${planInfo.color}`}>
                    {planInfo.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {status.sites_used}/{status.sites_limit} 사이트 사용 중
                </p>
                {status.plan_updated_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    마지막 변경: {new Date(status.plan_updated_at).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>

              {/* 업그레이드 버튼 */}
              {status.can_upgrade && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    플랜 업그레이드
                  </p>

                  {status.plan === "starter" && (
                    <>
                      <button
                        onClick={() => onUpgrade("pro")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>🚀</span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-green-700">Pro</p>
                            <p className="text-xs text-green-600">₩49,000/월 · 2사이트</p>
                          </div>
                        </div>
                        <span className="text-green-500 text-sm">→</span>
                      </button>

                      <button
                        onClick={() => onUpgrade("enterprise")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>🏢</span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-purple-700">Enterprise</p>
                            <p className="text-xs text-purple-600">₩190,000~/월 · 5사이트</p>
                          </div>
                        </div>
                        <span className="text-purple-500 text-sm">→</span>
                      </button>
                    </>
                  )}

                  {status.plan === "pro" && (
                    <button
                      onClick={() => onUpgrade("enterprise")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-purple-700">Enterprise</p>
                          <p className="text-xs text-purple-600">₩190,000~/월 · 5사이트</p>
                        </div>
                      </div>
                      <span className="text-purple-500 text-sm">→</span>
                    </button>
                  )}
                </div>
              )}

              {/* Enterprise 사용자 안내 */}
              {!status.can_upgrade && (
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-purple-700 font-medium">
                    최상위 플랜을 이용 중입니다
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
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
