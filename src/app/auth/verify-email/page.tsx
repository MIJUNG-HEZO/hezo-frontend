"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleRequestVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const res: { expires_at: string; verification_url: string | null } = await api
        .post("api/v1/auth/email-verification/request")
        .json();

      setSent(true);

      // 개발 환경에서는 verification_url이 반환됨 → 콘솔에 출력
      if (res.verification_url) {
        console.log("📧 이메일 인증 URL (개발용):", res.verification_url);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          if (body.error?.code === "EMAIL_ALREADY_VERIFIED") {
            // 이미 인증됨 → 대시보드로 이동
            router.push("/");
            return;
          }
          setError(body.error?.message || body.detail || "인증 메일 발송에 실패했습니다");
        } catch {
          setError("서버 연결에 실패했습니다");
        }
      } else {
        setError("서버 연결에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 w-[440px] shadow-sm text-center">
        {/* 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center text-3xl">
          📧
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">이메일 인증이 필요합니다</h1>
        <p className="text-sm text-gray-500 mb-6">
          사이트 발행 및 결제를 위해 이메일 인증을 완료해 주세요.
          <br />
          인증 메일을 보내드립니다.
        </p>

        {/* 에러 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {!sent ? (
          <>
            <button
              onClick={handleRequestVerification}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 mb-3"
            >
              {loading ? "발송 중..." : "인증 메일 보내기"}
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50"
            >
              나중에 하기
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">✅ 인증 메일이 발송되었습니다</p>
              <p className="text-xs text-green-600 mt-1">
                이메일 수신함을 확인하고 인증 링크를 클릭해 주세요.
              </p>
            </div>

            <button
              onClick={handleRequestVerification}
              disabled={loading}
              className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "재발송 중..." : "인증 메일 재발송"}
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-2.5 text-gray-400 text-xs hover:text-gray-600"
            >
              나중에 인증하기 →
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-6">
          인증하지 않아도 사이트 생성과 프리뷰는 이용 가능합니다.
          <br />
          발행 및 결제 시 이메일 인증이 필요합니다.
        </p>
      </div>
    </div>
  );
}
