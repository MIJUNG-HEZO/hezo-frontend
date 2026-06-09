"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const NAVER_REDIRECT_URI = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/oauth/naver/callback`;

interface OAuthLoginResponse {
  signup_required: boolean;
  access_token: string | null;
  token_type: string;
  signup_token: string | null;
  provider: string | null;
  suggested_email: string | null;
  suggested_name: string | null;
}

export default function NaverCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "signup_required" | "error">("processing");
  const [error, setError] = useState("");
  const [signupData, setSignupData] = useState<{
    signup_token: string;
    suggested_email: string;
    suggested_name: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setError("네이버 인증 코드가 없습니다.");
      return;
    }

    const handleOAuth = async () => {
      try {
        const res = await api.post("api/v1/auth/oauth/naver", {
          json: { code, redirect_uri: NAVER_REDIRECT_URI },
        }).json<OAuthLoginResponse>();

        if (!res.signup_required && res.access_token) {
          localStorage.setItem("access_token", res.access_token);
          router.push("/");
        } else if (res.signup_required && res.signup_token) {
          setSignupData({
            signup_token: res.signup_token,
            suggested_email: res.suggested_email || "",
            suggested_name: res.suggested_name || "",
          });
          setEmail(res.suggested_email || "");
          setName(res.suggested_name || "");
          setStatus("signup_required");
        }
      } catch (err: unknown) {
        setStatus("error");
        if (err && typeof err === "object" && "response" in err) {
          try {
            const body = await (err as { response: Response }).response.json();
            setError(body.error?.message || body.detail || "네이버 로그인에 실패했습니다.");
          } catch {
            setError("서버 연결에 실패했습니다.");
          }
        } else {
          setError("네이버 로그인에 실패했습니다.");
        }
      }
    };

    handleOAuth();
  }, [searchParams, router]);

  const handleCompleteSignup = async () => {
    if (!signupData) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post("api/v1/auth/oauth/complete-signup", {
        json: {
          signup_token: signupData.signup_token,
          email,
          name,
        },
      }).json<OAuthLoginResponse>();

      if (res.access_token) {
        localStorage.setItem("access_token", res.access_token);
        router.push("/auth/verify-email");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          setError(body.error?.message || body.detail || "회원가입에 실패했습니다.");
        } catch {
          setError("서버 연결에 실패했습니다.");
        }
      } else {
        setError("회원가입에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 w-[440px] shadow-sm text-center">
        {status === "processing" && (
          <>
            <div className="w-12 h-12 mx-auto mb-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">네이버 로그인 처리 중...</h1>
            <p className="text-sm text-gray-500">잠시만 기다려 주세요.</p>
          </>
        )}

        {status === "signup_required" && signupData && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              N
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">추가 정보를 입력해 주세요</h1>
            <p className="text-sm text-gray-500 mb-6">네이버 계정으로 처음 로그인합니다.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-sm text-gray-600 mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="이메일"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="이름"
                />
              </div>
              <button
                onClick={handleCompleteSignup}
                disabled={loading || !email || !name}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "처리 중..." : "가입 완료"}
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              ❌
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">로그인 실패</h1>
            <p className="text-sm text-red-500 mb-6">{error}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
