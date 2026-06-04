"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "api/v1/auth/login" : "api/v1/auth/signup";
      const body = mode === "login"
        ? { email, password }
        : { email, password, name };

      const res: { access_token: string } = await api.post(endpoint, { json: body }).json();

      // JWT 저장
      localStorage.setItem("access_token", res.access_token);

      // 메인 페이지로 이동 (페이지에서 API로 사이트 유무 확인)
      router.push("/");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const data = await (err as { response: Response }).response.json();
          setError((data as { detail?: string }).detail || "요청에 실패했습니다");
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
            disabled
            className="w-full py-3 bg-[#FEE500] text-gray-900 rounded-lg font-medium text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            💬 카카오로 시작하기
            <span className="text-[9px] text-gray-500">(준비 중)</span>
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
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        {/* 모드 전환 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-xs text-green-600 hover:underline"
          >
            {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
