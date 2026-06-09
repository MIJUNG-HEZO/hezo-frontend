"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Logo } from "@/components/landing/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

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

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
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
        return;
      } else {
        const res: { access_token: string } = await api
          .post("api/v1/auth/login", { json: { email: data.email, password: data.password } })
          .json();

        localStorage.setItem("access_token", res.access_token);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
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

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[400px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <p className="mt-3 text-sm text-gray-500">AI 검색 친화 홈페이지를 만들어 보세요</p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-3 text-xs text-error-600">
            {error}
          </div>
        )}

        {/* 소셜 로그인 (준비 중) */}
        <div className="mb-5 flex flex-col gap-2.5">
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#FEE500] py-3 text-sm font-medium text-gray-900 opacity-60"
          >
            <Icon name="message-circle" size={16} /> 카카오로 시작하기
            <span className="text-[9px] text-gray-600">(준비 중)</span>
          </button>
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#03C75A] py-3 text-sm font-medium text-white opacity-60"
          >
            <span className="font-bold">N</span> 네이버로 시작하기
            <span className="text-[9px] text-white/80">(준비 중)</span>
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">이메일로 계속</span>
          </div>
        </div>

        {/* 폼 */}
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
            <Button type="submit" hierarchy="primary" size="lg" disabled={loading} className="w-full">
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
            <Button type="submit" hierarchy="primary" size="lg" disabled={loading} className="w-full">
              {loading ? "처리 중..." : "회원가입"}
            </Button>
          </form>
        )}

        {/* 모드 전환 */}
        <div className="mt-4 text-center">
          <button
            onClick={switchMode}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
