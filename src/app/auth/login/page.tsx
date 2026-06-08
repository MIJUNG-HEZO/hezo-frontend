"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해 주세요"),
  password: z.string().min(1, "비밀번호를 입력해 주세요"),
});

const signupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해 주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  name: z.string().min(1, "이름을 입력해 주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleSubmit = async (data: LoginFormData | SignupFormData) => {
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // 1. 회원가입 (토큰 반환 안 함 — 유저 정보만 반환)
        await api.post("api/v1/auth/signup", { json: data }).json();

        // 2. 회원가입 성공 후 자동 로그인
        const loginRes: { access_token: string } = await api
          .post("api/v1/auth/login", { json: { email: data.email, password: data.password } })
          .json();

        localStorage.setItem("access_token", loginRes.access_token);

        // 3. 이메일 인증 페이지로 이동
        router.push("/auth/verify-email");
        return;
      } else {
        // 로그인
        const res: { access_token: string } = await api
          .post("api/v1/auth/login", { json: { email: data.email, password: data.password } })
          .json();

        localStorage.setItem("access_token", res.access_token);
      }

      // 메인 페이지로 이동
      router.push("/");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          // 백엔드 팀 에러 형식: { error: { code, message } } 또는 { detail: "..." }
          if (body.error?.message) {
            setError(body.error.message);
          } else if (body.detail) {
            setError(body.detail);
          } else {
            setError("요청에 실패했습니다");
          }
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

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 w-[400px] shadow-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">HEZO</h1>
          <p className="text-sm text-gray-500 mt-2">AI 검색 친화 홈페이지를 만들어 보세요</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* 소셜 로그인 버튼 (나중에 구현) */}
        <div className="space-y-2.5 mb-5">
          <button
            onClick={() => {
              const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "";
              const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
              const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
              window.location.href = kakaoAuthUrl;
            }}
            className="w-full py-3 bg-[#FEE500] text-gray-900 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#FDD800] transition-colors"
          >
            💬 카카오로 시작하기
          </button>
          <button
            disabled
            className="w-full py-3 bg-[#03C75A] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            <span className="font-bold">N</span> 네이버로 시작하기
            <span className="text-[9px] text-green-200">(준비 중)</span>
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">이메일로 계속</span></div>
        </div>

        {/* 이메일 로그인/회원가입 폼 */}
        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleSubmit)} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="이메일"
                {...loginForm.register("email")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="비밀번호"
                {...loginForm.register("password")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "처리 중..." : "로그인"}
            </button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(handleSubmit)} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름"
                {...signupForm.register("name")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {signupForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="이메일"
                {...signupForm.register("email")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {signupForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="비밀번호 (8자 이상)"
                {...signupForm.register("password")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {signupForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </form>
        )}

        {/* 모드 전환 */}
        <div className="mt-4 text-center">
          <button
            onClick={switchMode}
            className="text-xs text-green-600 hover:underline"
          >
            {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
