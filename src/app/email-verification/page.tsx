"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function EmailVerificationConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("인증 토큰이 없습니다. 이메일의 인증 링크를 다시 확인해 주세요.");
      return;
    }

    const confirmVerification = async () => {
      try {
        await api.post("api/v1/auth/email-verification/confirm", {
          json: { token },
        }).json();

        setStatus("success");

        // 3초 후 대시보드로 이동
        setTimeout(() => {
          router.push("/");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 w-[440px] shadow-sm text-center">
        {/* 인증 중 */}
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 mx-auto mb-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">이메일 인증 중...</h1>
            <p className="text-sm text-gray-500">잠시만 기다려 주세요.</p>
          </>
        )}

        {/* 인증 성공 */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✅
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">이메일 인증 완료!</h1>
            <p className="text-sm text-gray-500 mb-6">
              이메일 인증이 성공적으로 완료되었습니다.
              <br />
              잠시 후 대시보드로 이동합니다.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              대시보드로 이동
            </button>
          </>
        )}

        {/* 인증 실패 */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              ❌
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">인증 실패</h1>
            <p className="text-sm text-red-500 mb-6">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/auth/verify-email")}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                인증 메일 재발송
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50"
              >
                대시보드로 이동
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
