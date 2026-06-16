"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishSite } from "@/lib/api";
import PricingModal from "@/components/chat/PricingModal";
import { cn } from "@/lib/utils";

interface PublishButtonProps {
  siteId: string;
  siteStatus: string;
  userPlan: "free" | "pro" | "max";
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
  const [currentPlan, setCurrentPlan] = useState(userPlan);

  const isDisabled = siteStatus !== "preview_ready";
  const needsUpgrade = currentPlan === "free" || sitesUsed >= sitesLimit;

  const doPublish = async () => {
    setIsLoading(true);
    try {
      await publishSite(siteId);
      setSuccessMessage("사이트가 성공적으로 발급되었습니다!");
      setTimeout(() => router.push("/dashboard"), 2000);
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

  const handlePublish = async () => {
    if (needsUpgrade) {
      setShowPricingModal(true);
      return;
    }
    await doPublish();
  };

  const handlePlanSelect = (plan: string) => {
    setShowPricingModal(false);
    if (plan !== "free") {
      setCurrentPlan(plan as "free" | "pro" | "max");
      doPublish();
    }
  };

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isDisabled || isLoading}
        className={cn(
          "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors sm:px-6 sm:py-2",
          isDisabled
            ? "cursor-not-allowed bg-gray-200 text-gray-400"
            : isLoading
              ? "cursor-wait bg-primary-400 text-white"
              : "bg-primary-500 text-white hover:bg-primary-600",
        )}
      >
        {isLoading ? "발급 중..." : isDisabled ? "준비 중" : "사이트 발급하기"}
      </button>

      {successMessage && (
        <div className="mt-2 rounded-lg border border-success-200 bg-success-50 px-3 py-1.5 text-xs text-success-700">
          {successMessage}
        </div>
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelect={handlePlanSelect}
        currentPlan={currentPlan}
      />
    </>
  );
}
