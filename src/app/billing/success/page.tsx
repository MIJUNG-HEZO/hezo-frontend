"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function BillingSuccess() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const amount = search.get("amount");
  const paymentKey = search.get("paymentKey");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
        </div>

        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <Icon name="check" size={24} className="text-success-600" />
        </span>
        <h1 className="font-display text-xl font-bold text-gray-900">결제 정보가 확인되었습니다</h1>
        <p className="mt-2 text-sm text-gray-500">
          결제 승인 처리 후 플랜이 적용됩니다.
        </p>

        <div className="mt-5 rounded-xl bg-gray-50 p-4 text-left text-xs text-gray-600">
          {orderId && <p>주문번호: <span className="font-mono text-gray-900">{orderId}</span></p>}
          {amount && <p className="mt-1">결제금액: <span className="font-semibold text-gray-900">₩{Number(amount).toLocaleString("ko-KR")}</span></p>}
          {paymentKey && <p className="mt-1 break-all">paymentKey: <span className="font-mono">{paymentKey}</span></p>}
        </div>

        <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-left text-xs text-warning-700">
          참고: 최종 결제 승인(confirm)은 백엔드 승인 엔드포인트 연동이 필요합니다.
        </div>

        <div className="mt-6">
          <Button hierarchy="primary" size="lg" className="w-full" onClick={() => router.replace("/dashboard")}>
            대시보드로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccess />
    </Suspense>
  );
}
