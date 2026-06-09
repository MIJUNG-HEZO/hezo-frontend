"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function EmailVerificationConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [error, setError] = useState(
    token ? "" : "인증 토큰이 없습니다. 이메일의 인증 링크를 다시 확인해 주세요.",
  );

  useEffect(() => {
    if (!token) return;

    const confirmVerification = async () => {
      try {
        await api.post("api/v1/auth/email-verification/confirm", { json: { token } }).json();
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err: unknown) {
        setStatus("error");
        if (err && typeof err === "object" && "response" in err) {
          try {
            const body = await (err as { response: Response }).response.json();
            setError(body.error?.message || body.detail || "인증에 실패했습니다");
          } catch {
            setError("서버 연결에 실패했습니다");
          }
        } else {
          setError("서버 연결에 실패했습니다");
        }
      }
    };

    confirmVerification();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <h1 className="mb-2 font-display text-xl font-bold text-gray-900">이메일 인증 중...</h1>
            <p className="text-sm text-gray-500">잠시만 기다려 주세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50">
              <Icon name="circle-check-big" size={30} className="text-success-600" />
            </div>
            <h1 className="mb-2 font-display text-xl font-bold text-gray-900">이메일 인증 완료!</h1>
            <p className="mb-6 text-sm text-gray-500 [word-break:keep-all]">
              이메일 인증이 성공적으로 완료되었습니다. 잠시 후 대시보드로 이동합니다.
            </p>
            <Button hierarchy="primary" size="md" onClick={() => router.push("/dashboard")}>
              대시보드로 이동
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50">
              <Icon name="circle-x" size={30} className="text-error-600" />
            </div>
            <h1 className="mb-2 font-display text-xl font-bold text-gray-900">인증 실패</h1>
            <p className="mb-6 text-sm text-error-500 [word-break:keep-all]">{error}</p>
            <div className="flex flex-col gap-2">
              <Button
                hierarchy="primary"
                size="md"
                onClick={() => router.push("/auth/verify-email")}
                className="w-full"
              >
                인증 메일 재발송
              </Button>
              <Button
                hierarchy="secondary"
                size="md"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                대시보드로 이동
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
