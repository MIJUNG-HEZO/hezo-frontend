"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function BillingFail() {
  const router = useRouter();
  const search = useSearchParams();
  const message = search.get("message");
  const code = search.get("code");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
        </div>

        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-50">
          <Icon name="circle-x" size={24} className="text-error-600" />
        </span>
        <h1 className="font-display text-xl font-bold text-gray-900">결제가 완료되지 않았습니다</h1>
        <p className="mt-2 text-sm text-gray-500">
          {message || "결제가 취소되었거나 처리 중 문제가 발생했습니다."}
        </p>
        {code && <p className="mt-1 text-xs text-gray-400">오류 코드: {code}</p>}

        <div className="mt-6 flex gap-2">
          <Button
            hierarchy="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.replace("/dashboard")}
          >
            대시보드
          </Button>
          <Button
            hierarchy="primary"
            size="lg"
            className="flex-1"
            onClick={() => router.back()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BillingFailPage() {
  return (
    <Suspense fallback={null}>
      <BillingFail />
    </Suspense>
  );
}
