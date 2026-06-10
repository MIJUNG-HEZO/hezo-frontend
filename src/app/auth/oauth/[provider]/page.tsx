"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  oauthLogin,
  completeOAuthSignup,
  getApiErrorMessage,
  type OAuthProvider,
} from "@/lib/api";
import { oauthRedirectUri, consumeNaverState } from "@/lib/oauth";
import { Logo } from "@/components/landing/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function isProvider(v: string | undefined): v is OAuthProvider {
  return v === "kakao" || v === "naver";
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}

function OAuthCallback() {
  const params = useParams<{ provider: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);

  const [phase, setPhase] = useState<"loading" | "signup" | "error">("loading");
  const [error, setError] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const provider = params?.provider;

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      if (!isProvider(provider)) {
        setPhase("error");
        setError("지원하지 않는 로그인 제공자입니다.");
        return;
      }

      const oauthError = search.get("error");
      if (oauthError) {
        setPhase("error");
        setError(`로그인이 취소되었거나 실패했습니다 (${oauthError}).`);
        return;
      }

      const code = search.get("code");
      if (!code) {
        setPhase("error");
        setError("인가 코드를 받지 못했습니다.");
        return;
      }

      if (provider === "naver") {
        const returned = search.get("state");
        const saved = consumeNaverState();
        if (!returned || !saved || returned !== saved) {
          setPhase("error");
          setError("보안 검증(state)에 실패했습니다. 다시 시도해 주세요.");
          return;
        }
      }

      try {
        const res = await oauthLogin(provider, {
          code,
          redirect_uri: oauthRedirectUri(provider),
        });
        if (res.access_token) {
          localStorage.setItem("access_token", res.access_token);
          router.replace("/dashboard");
          return;
        }
        if (res.signup_required && res.signup_token) {
          setSignupToken(res.signup_token);
          setEmail(res.suggested_email ?? "");
          setName(res.suggested_name ?? "");
          setPhase("signup");
          return;
        }
        setPhase("error");
        setError("로그인 응답이 올바르지 않습니다.");
      } catch (err) {
        setPhase("error");
        setError(await getApiErrorMessage(err, "소셜 로그인에 실패했습니다."));
      }
    };

    void run();
  }, [provider, search, router]);

  const onCompleteSignup = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await completeOAuthSignup({ signup_token: signupToken, email, name });
      if (res.access_token) {
        localStorage.setItem("access_token", res.access_token);
        router.replace("/dashboard");
        return;
      }
      setError("가입 완료 응답이 올바르지 않습니다.");
    } catch (err) {
      setError(await getApiErrorMessage(err, "가입 완료에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "loading") return <Spinner />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[400px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
        </div>

        {phase === "error" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-error-600">{error}</p>
            <Button hierarchy="primary" size="md" onClick={() => router.replace("/auth/login")}>
              로그인으로 돌아가기
            </Button>
          </div>
        )}

        {phase === "signup" && (
          <form onSubmit={onCompleteSignup} className="flex flex-col gap-3">
            <p className="mb-1 text-center text-sm text-gray-500">
              가입을 완료하려면 정보를 확인해 주세요.
            </p>
            {error && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-600">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-gray-600">이름</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">이메일</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" />
            </div>
            <Button type="submit" hierarchy="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? "처리 중..." : "가입 완료"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <OAuthCallback />
    </Suspense>
  );
}
