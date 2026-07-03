"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, getApiErrorMessage, getCurrentUser } from "@/lib/api";
import { startOAuthLogin } from "@/lib/oauth";
import { Logo } from "@/components/landing/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

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

const STATS = [
  { value: "1,200+", label: "생성된 사이트" },
  { value: "15분", label: "평균 제작 시간" },
  { value: "82점", label: "AI 친화도 평균" },
];

const CITATIONS = [
  { color: "#10a37f", icon: "quote" as const,  label: "ChatGPT가 인용함",    query: "강남 추나요법 한의원 추천" },
  { color: "#20B8CD", icon: "search" as const, label: "Perplexity가 인용함", query: "서울 한의원 예약"            },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginForm  = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const handleSubmit = async (data: LoginFormData | SignupFormData) => {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await api.post("api/v1/auth/signup", { json: data }).json();
        const loginRes: { access_token: string } = await api
          .post("api/v1/auth/login", { json: { email: data.email, password: data.password } })
          .json();
        localStorage.setItem("access_token", loginRes.access_token);
        router.push("/auth/verify-email");
      } else {
        const res: { access_token: string } = await api
          .post("api/v1/auth/login", { json: { email: data.email, password: data.password } })
          .json();
        localStorage.setItem("access_token", res.access_token);
        try {
          const me = await getCurrentUser();
          if (me.role === "admin") {
            localStorage.setItem("admin_token", res.access_token);
            document.cookie = `admin_token=${res.access_token}; path=/; max-age=86400; SameSite=Lax`;
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      setError(await getApiErrorMessage(err, "서버 연결에 실패했습니다"));
    } finally { setLoading(false); }
  };

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
    loginForm.reset();
    signupForm.reset();
  };

  const handleOAuth = (provider: "kakao" | "naver") => {
    setError("");
    const started = startOAuthLogin(provider);
    if (!started) {
      const key = provider === "kakao" ? "NEXT_PUBLIC_KAKAO_CLIENT_ID" : "NEXT_PUBLIC_NAVER_CLIENT_ID";
      setError(`${provider === "kakao" ? "카카오" : "네이버"} 로그인 키가 설정되지 않았습니다 (${key}).`);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen">

      {/* ── 좌: 브랜드 패널 ───────────────────────────────────────────────── */}
      <div className="hidden flex-col bg-gray-900 px-14 py-12 lg:flex lg:w-[460px] xl:w-[520px]">
        <Logo dark size={34} />

        <div className="mt-14 flex-1">
          <h1 className="font-display text-[34px] font-bold leading-[1.2] tracking-[-0.03em] text-white [word-break:keep-all]">
            AI 검색 시대,<br />
            <span className="text-primary-400">가장 먼저</span> 준비하세요
          </h1>
          <p className="mt-4 text-[15px] leading-[1.75] text-gray-400 [word-break:keep-all]">
            ChatGPT·Perplexity가 당신의 가게를 찾고<br />
            추천하도록, HEZO가 만들어 드립니다.
          </p>

          {/* 지표 */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4">
                <div className="font-display text-[22px] font-bold text-primary-400">{s.value}</div>
                <div className="mt-1 text-[11px] text-gray-500 [word-break:keep-all]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 인용 칩 */}
          <div className="mt-7 flex flex-col gap-2.5">
            {CITATIONS.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3"
              >
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg"
                  style={{ background: `${c.color}22` }}
                >
                  <Icon name={c.icon} size={14} className={`text-[${c.color}]`} style={{ color: c.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">{c.label}</div>
                  <div className="truncate text-[11px] text-gray-500">&ldquo;{c.query}&rdquo;</div>
                </div>
                <span className="ml-auto h-1.5 w-1.5 flex-none rounded-full" style={{ background: c.color }} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-600">첫 사이트 무료 · 신용카드 없이 시작</p>
      </div>

      {/* ── 우: 폼 패널 ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-14">

        {/* 모바일 전용 로고 */}
        <div className="mb-8 lg:hidden">
          <Logo size={32} />
        </div>

        <div className="w-full max-w-[380px]">

          {/* 모드 탭 */}
          <div className="mb-7 flex rounded-xl bg-gray-100 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  mode === m
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          {/* 페이지 제목 */}
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-gray-900">
              {isLogin ? "다시 오셨군요!" : "무료로 시작하기"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isLogin ? "계속하려면 로그인해 주세요" : "첫 사이트는 영원히 무료입니다"}
            </p>
          </div>

          {/* 에러 */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-error-200 bg-error-50 px-3 py-3">
              <Icon name="triangle-alert" size={14} className="mt-0.5 flex-none text-error-500" />
              <p className="text-xs text-error-600 [word-break:keep-all]">{error}</p>
            </div>
          )}

          {/* 소셜 버튼 */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuth("kakao")}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3 text-[15px] font-semibold text-gray-900 transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5C4.858 1.5 1.5 4.168 1.5 7.458c0 2.07 1.285 3.89 3.232 4.98l-.82 3.063c-.072.27.246.485.48.325l3.532-2.34A9.07 9.07 0 009 13.417c4.142 0 7.5-2.669 7.5-5.959S13.142 1.5 9 1.5z" fill="#191919"/>
              </svg>
              카카오로 계속하기
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("naver")}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#03C75A] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M10.18 9.15L7.62 5H5.25v8h2.57V8.85L10.38 13H12.75V5H10.18v4.15z" fill="#ffffff"/>
              </svg>
              네이버로 계속하기
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">이메일로 계속</span>
            </div>
          </div>

          {/* 이메일 폼 */}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleSubmit)} className="flex flex-col gap-3">
              <div>
                <Input
                  type="email"
                  placeholder="이메일"
                  invalid={!!loginForm.formState.errors.email}
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="비밀번호"
                  invalid={!!loginForm.formState.errors.password}
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" hierarchy="primary" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? "처리 중..." : "로그인"}
              </Button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSubmit)} className="flex flex-col gap-3">
              <div>
                <Input
                  type="text"
                  placeholder="이름"
                  invalid={!!signupForm.formState.errors.name}
                  {...signupForm.register("name")}
                />
                {signupForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-error-500">{signupForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="이메일"
                  invalid={!!signupForm.formState.errors.email}
                  {...signupForm.register("email")}
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error-500">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="비밀번호 (8자 이상)"
                  invalid={!!signupForm.formState.errors.password}
                  {...signupForm.register("password")}
                />
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error-500">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" hierarchy="primary" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? "처리 중..." : "회원가입"}
              </Button>
            </form>
          )}

          {/* 약관 (회원가입 시) */}
          {!isLogin && (
            <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
              가입하면{" "}
              <a href="#" className="underline hover:text-gray-600">이용약관</a>
              {" "}및{" "}
              <a href="#" className="underline hover:text-gray-600">개인정보처리방침</a>
              에 동의하게 됩니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
