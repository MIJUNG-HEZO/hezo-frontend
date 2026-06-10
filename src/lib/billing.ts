// Toss Payments 결제 흐름 헬퍼.
//
// 백엔드 POST /billing/checkout 가 결제 요청을 만들고 payment_params(camelCase,
// Toss v1 호환: amount/orderId/orderName/customerEmail/successUrl/failUrl)를 돌려준다.
// 프론트는 Toss SDK로 결제창을 띄운다.
//
// 동작하려면:
//  - 프론트 .env.local: NEXT_PUBLIC_TOSS_CLIENT_KEY (Toss 클라이언트 키, 테스트키 가능)
//  - 백엔드 .env: TOSS_PAYMENTS_SECRET_KEY (결제 승인용)
//  - 결제 승인 최종 처리(success 페이지 → 백엔드 confirm)는 별도 엔드포인트가 필요하다.

import { createCheckout } from "@/lib/api";

const TOSS_SDK_URL = "https://js.tosspayments.com/v1/payment";

interface TossPaymentsInstance {
  requestPayment(method: string, options: Record<string, unknown>): Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadTossSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("브라우저에서만 결제할 수 있습니다."));
  if (window.TossPayments) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TOSS_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export function isCheckoutConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
}

/**
 * 실결제 시작: 백엔드에 결제요청 생성 후 Toss 결제창을 띄운다.
 * 성공 시 Toss가 successUrl 로 리다이렉트하므로 이 함수는 보통 반환 전에 페이지를 떠난다.
 * 키 미설정/취소 시 예외를 던진다.
 */
export async function startCheckout(planKeyOrCode: string): Promise<void> {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("결제 키(NEXT_PUBLIC_TOSS_CLIENT_KEY)가 설정되지 않았습니다.");
  }

  const checkout = await createCheckout(planKeyOrCode);
  const p = checkout.payment_params as {
    amount: number;
    orderId: string;
    orderName: string;
    customerEmail?: string;
    successUrl?: string;
    failUrl?: string;
  };

  await loadTossSdk();
  const tossPayments = window.TossPayments?.(clientKey);
  if (!tossPayments) throw new Error("결제 모듈 초기화에 실패했습니다.");

  const origin = window.location.origin;
  await tossPayments.requestPayment("카드", {
    amount: p.amount ?? checkout.amount,
    orderId: p.orderId,
    orderName: p.orderName,
    customerEmail: p.customerEmail,
    successUrl: p.successUrl ?? `${origin}/billing/success`,
    failUrl: p.failUrl ?? `${origin}/billing/fail`,
  });
}
