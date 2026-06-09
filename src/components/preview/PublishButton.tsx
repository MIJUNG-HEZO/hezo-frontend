"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishSite } from "@/lib/api";
import PricingModal from "@/components/chat/PricingModal";
import { cn } from "@/lib/utils";

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

  const handlePublish = async () => {
    if (userPlan === "starter" || sitesUsed >= sitesLimit) {
      setShowPricingModal(true);
      return;
    }
    setIsLoading(true);
    try {
      await publishSite(siteId);
      setSuccessMessage("사이트가 성공적으로 발급되었습니다!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: unknown) {
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
  };

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isDisabled || isLoading}
        className={cn(
          "rounded-md px-6 py-3 text-sm font-semibold transition-colors",
          isDisabled
            ? "cursor-not-allowed bg-gray-200 text-gray-400"
            : isLoading
              ? "cursor-wait bg-primary-400 text-white"
              : "bg-primary-600 text-white hover:bg-primary-700",
        )}
      >
        {isLoading ? "발급 중..." : isDisabled ? "프리뷰 준비 중" : "사이트 발급하기"}
      </button>

      {successMessage && (
        <div className="mt-3 rounded-lg border border-success-200 bg-success-50 px-4 py-2 text-sm text-success-700">
          {successMessage}
          <span className="mt-1 block text-xs text-success-500">
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
