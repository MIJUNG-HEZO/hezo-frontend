"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPayment } from "@/lib/api";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function BillingSuccess() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const amount = search.get("amount");
  const paymentKey = search.get("paymentKey");

  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 파라미터가 누락되었습니다.");
      return;
    }

    confirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then(() => setStatus("success"))
      .catch(async (err: unknown) => {
        let msg = "결제 승인에 실패했습니다. 고객센터로 문의해 주세요.";
        if (err && typeof err === "object" && "response" in err) {
          try {
            const body = await (err as { response: Response }).response.json();
            msg = body?.error?.message ?? body?.message ?? msg;
          } catch {}
        }
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [paymentKey, orderId, amount]);

  if (status === "confirming") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <Logo />
          </div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <h1 className="font-display text-xl font-bold text-gray-900">결제 승인 처리 중...</h1>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <Logo />
          </div>
          <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-50">
            <Icon name="circle-x" size={24} className="text-error-600" />
          </span>
          <h1 className="font-display text-xl font-bold text-gray-900">결제 승인 실패</h1>
          <p className="mt-2 text-sm text-gray-500">{errorMsg}</p>
          <div className="mt-6 flex gap-2">
            <Button hierarchy="secondary" size="lg" className="flex-1" onClick={() => router.replace("/dashboard")}>
              대시보드
            </Button>
            <Button hierarchy="primary" size="lg" className="flex-1" onClick={() => router.back()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
        </div>
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <Icon name="check" size={24} className="text-success-600" />
        </span>
        <h1 className="font-display text-xl font-bold text-gray-900">결제가 완료되었습니다</h1>
        <p className="mt-2 text-sm text-gray-500">플랜이 즉시 적용되었습니다.</p>

        {amount && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4 text-left text-xs text-gray-600">
            {orderId && <p>주문번호: <span className="font-mono text-gray-900">{orderId}</span></p>}
            <p className="mt-1">결제금액: <span className="font-semibold text-gray-900">₩{Number(amount).toLocaleString("ko-KR")}</span></p>
          </div>
        )}

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
