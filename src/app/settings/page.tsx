"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth-guard";

// Zod v4 스키마 (hookform/resolvers 없이 수동 검증)
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요"),
  newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다"),
  confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("김동균");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editName, setEditName] = useState(profileName);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PasswordFormData>();

  const handleProfileSave = () => {
    setProfileName(editName);
    setIsEditingProfile(false);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    // Zod 수동 검증
    const result = passwordSchema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PasswordFormData;
        if (field) {
          setError(field, { message: issue.message });
        }
      }
      return;
    }
    // Mock: 비밀번호 변경 성공
    setPasswordSuccess(true);
    reset();
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-1">계정 정보와 플랜을 관리합니다.</p>
      </div>

      {/* 프로필 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">프로필</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-gray-500">이름</label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 mt-1">{profileName}</p>
              )}
            </div>
            {isEditingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={handleProfileSave}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  저장
                </button>
                <button
                  onClick={() => { setIsEditingProfile(false); setEditName(profileName); }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                수정
              </button>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">이메일</label>
            <p className="text-sm font-medium text-gray-900 mt-1">user@hezo.app</p>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">비밀번호가 성공적으로 변경되었습니다.</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">현재 비밀번호</label>
            <input
              type="password"
              {...register("currentPassword", { required: "현재 비밀번호를 입력하세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="현재 비밀번호 입력"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">새 비밀번호</label>
            <input
              type="password"
              {...register("newPassword", { required: "새 비밀번호를 입력하세요", minLength: { value: 8, message: "8자 이상 입력하세요" } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="새 비밀번호 (8자 이상)"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              {...register("confirmPassword", { required: "비밀번호 확인을 입력하세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="새 비밀번호 다시 입력"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            비밀번호 변경
          </button>
        </form>
      </div>

      {/* 플랜 정보 */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">플랜 정보</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Starter 플랜</p>
                <p className="text-xs text-gray-500">무료 · 사이트 1개 생성 가능</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>사이트 사용량: <strong className="text-gray-900">1 / 1</strong></span>
              <span>LLM 벤치마크: <strong className="text-gray-900">월 1회</strong></span>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
            업그레이드
          </button>
        </div>
      </div>

      {/* 위험 구역 */}
      <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm">
        <h2 className="text-lg font-semibold text-red-600 mb-2">위험 구역</h2>
        <p className="text-sm text-gray-500 mb-4">
          계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          계정 삭제
        </button>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-[400px] shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
              <p className="text-sm text-gray-500">
                계정을 삭제하면 모든 사이트, 구독, 데이터가 삭제됩니다.
                <br />
                <strong className="text-red-600">이 작업은 되돌릴 수 없습니다.</strong>
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError("");
                  try {
                    await api.delete("api/v1/auth/me").text();
                    logout();
                    router.push("/auth/login");
                  } catch (err: unknown) {
                    if (err && typeof err === "object" && "response" in err) {
                      try {
                        const body = await (err as { response: Response }).response.json();
                        setDeleteError(body.error?.message || "계정 삭제에 실패했습니다.");
                      } catch {
                        setDeleteError("계정 삭제에 실패했습니다.");
                      }
                    } else {
                      setDeleteError("서버 연결에 실패했습니다.");
                    }
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "삭제 중..." : "계정 삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
