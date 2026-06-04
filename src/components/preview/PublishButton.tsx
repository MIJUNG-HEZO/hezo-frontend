"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishSite } from "@/lib/api";
import PricingModal from "@/components/chat/PricingModal";

interface PublishButtonProps {
  siteId: string;
  siteStatus: string;
  userPlan: "starter" | "pro" | "enterprise";
  sitesUsed: number;
  sitesLimit: number;
}

export default function PublishButton({
  siteId,
  siteStatus,
  userPlan,
  sitesUsed,
  sitesLimit,
}: PublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDisabled = siteStatus !== "preview_ready";
  const canPublish =
    (userPlan === "pro" || userPlan === "enterprise") && sitesUsed < sitesLimit;

  const handlePublish = async () => {
    // Starter 또는 한도 초과 → PricingModal 표시
    if (userPlan === "starter" || sitesUsed >= sitesLimit) {
      setShowPricingModal(true);
      return;
    }

    // 유료 플랜 + 한도 미달 → 즉시 POST /publish 호출
    setIsLoading(true);
    try {
      await publishSite(siteId);
      setSuccessMessage("사이트가 성공적으로 발급되었습니다!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: unknown) {
      // 403 응답 시 PricingModal 자동 표시
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response: { status: number } }).response?.status === 403
      ) {
        setShowPricingModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePlanSelect = (_plan: string) => {
    setShowPricingModal(false);
    // 업그레이드 로직은 PricingModal 내부에서 처리
  };

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isDisabled || isLoading}
        className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isLoading
            ? "bg-green-400 text-white cursor-wait"
            : canPublish
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isLoading
          ? "발급 중..."
          : isDisabled
          ? "프리뷰 준비 중"
          : "사이트 발급하기"}
      </button>

      {successMessage && (
        <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMessage}
          <span className="block text-xs text-green-500 mt-1">
            3초 후 대시보드로 이동합니다...
          </span>
        </div>
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelect={handlePlanSelect}
        currentPlan={userPlan}
      />
    </>
  );
}
