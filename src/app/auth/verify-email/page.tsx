"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getCurrentUser } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [notVerifiedYet, setNotVerifiedYet] = useState(false);

  const handleRequestVerification = async () => {
    setLoading(true);
    setError("");
    setNotVerifiedYet(false);

    try {
      await api.post("api/v1/auth/email-verification/request").json();
      setSent(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          if (body.error?.code === "EMAIL_ALREADY_VERIFIED") {
            router.push("/dashboard");
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

  const handleCheckAndGo = async () => {
    setChecking(true);
    setNotVerifiedYet(false);
    try {
      const user = await getCurrentUser();
      if (user.email_verified) {
        router.push("/dashboard");
      } else {
        setNotVerifiedYet(true);
      }
    } catch {
      setError("서버 연결에 실패했습니다");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[440px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50">
          <Icon name="mail" size={28} className="text-primary-600" />
        </div>

        <h1 className="mb-2 font-display text-xl font-bold text-gray-900">이메일 인증이 필요합니다</h1>
        <p className="mb-6 text-sm text-gray-500 [word-break:keep-all]">
          사이트 발행 및 결제를 위해 이메일 인증을 완료해 주세요. 인증 메일을 보내드립니다.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-3 text-xs text-error-600">
            {error}
          </div>
        )}

        {!sent ? (
          <div className="flex flex-col gap-3">
            <Button
              hierarchy="primary"
              size="lg"
              onClick={handleRequestVerification}
              disabled={loading}
              className="w-full"
            >
              {loading ? "발송 중..." : "인증 메일 보내기"}
            </Button>
            <Button hierarchy="secondary" size="lg" onClick={() => router.push("/dashboard")} className="w-full">
              나중에 하기
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-success-200 bg-success-50 p-4 text-left">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-700">
                <Icon name="circle-check-big" size={16} /> 인증 메일이 발송되었습니다
              </p>
              <p className="mt-1 text-xs text-success-600">
                이메일 수신함을 확인한 뒤 아래 버튼을 눌러주세요.
              </p>
            </div>

            {notVerifiedYet && (
              <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-3 text-xs text-warning-700">
                아직 이메일 인증이 완료되지 않았습니다. 메일의 링크를 클릭한 후 다시 시도해주세요.
              </div>
            )}

            <Button
              hierarchy="primary"
              size="lg"
              onClick={handleCheckAndGo}
              disabled={checking}
              className="w-full"
              iconLeading={<Icon name="check" size={16} />}
            >
              {checking ? "확인 중..." : "이메일 확인 후 이동하기"}
            </Button>

            <Button
              hierarchy="secondary"
              size="md"
              onClick={handleRequestVerification}
              disabled={loading}
              className="w-full"
            >
              {loading ? "재발송 중..." : "인증 메일 재발송"}
            </Button>

            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-gray-400 transition-colors hover:text-gray-600"
            >
              나중에 인증하기 →
            </button>
          </div>
        )}

        <p className="mt-6 text-[10px] text-gray-400 [word-break:keep-all]">
          인증하지 않아도 사이트 생성과 프리뷰는 이용 가능합니다. 발행 및 결제 시 이메일
          인증이 필요합니다.
        </p>
      </div>
    </div>
  );
}
