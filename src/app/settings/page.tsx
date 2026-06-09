"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요"),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("김동균");
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
    const result = passwordSchema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PasswordFormData;
        if (field) setError(field, { message: issue.message });
      }
      return;
    }
    setPasswordSuccess(true);
    reset();
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <>
      <TopBar title="설정" subtitle="계정 정보와 플랜을 관리합니다." />

      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
        {/* 프로필 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">프로필</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500">이름</label>
                {isEditingProfile ? (
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 max-w-xs"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-gray-900">{profileName}</p>
                )}
              </div>
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <Button hierarchy="primary" size="md" onClick={handleProfileSave}>저장</Button>
                  <Button
                    hierarchy="secondary"
                    size="md"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName(profileName);
                    }}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Button hierarchy="secondary" size="md" onClick={() => setIsEditingProfile(true)}>
                  수정
                </Button>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500">이메일</label>
              <p className="mt-1 text-sm font-medium text-gray-900">user@hezo.app</p>
            </div>
          </div>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">비밀번호 변경</h2>
          {passwordSuccess && (
            <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-3 py-3">
              <p className="text-sm text-success-700">비밀번호가 성공적으로 변경되었습니다.</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">현재 비밀번호</label>
              <Input
                type="password"
                placeholder="현재 비밀번호 입력"
                invalid={!!errors.currentPassword}
                {...register("currentPassword", { required: "현재 비밀번호를 입력하세요" })}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-error-500">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">새 비밀번호</label>
              <Input
                type="password"
                placeholder="새 비밀번호 (8자 이상)"
                invalid={!!errors.newPassword}
                {...register("newPassword", {
                  required: "새 비밀번호를 입력하세요",
                  minLength: { value: 8, message: "8자 이상 입력하세요" },
                })}
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-error-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">새 비밀번호 확인</label>
              <Input
                type="password"
                placeholder="새 비밀번호 다시 입력"
                invalid={!!errors.confirmPassword}
                {...register("confirmPassword", { required: "비밀번호 확인을 입력하세요" })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div>
              <Button type="submit" hierarchy="primary" size="md">비밀번호 변경</Button>
            </div>
          </form>
        </Card>

        {/* 플랜 정보 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">플랜 정보</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                  <Icon name="leaf" size={18} className="text-primary-600" />
                </span>
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
            <Button hierarchy="primary" size="md">업그레이드</Button>
          </div>
        </Card>

        {/* 위험 구역 */}
        <Card className="border-error-200">
          <h2 className="mb-2 font-display text-lg font-semibold text-error-600">위험 구역</h2>
          <p className="mb-4 text-sm text-gray-500">
            계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-error-50 px-4 py-2 text-sm font-medium text-error-400"
          >
            계정 삭제
            <span className="rounded bg-error-100 px-2 py-0.5 text-[10px]">준비 중</span>
          </button>
        </Card>
      </div>
    </>
  );
}
