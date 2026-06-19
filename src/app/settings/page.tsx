"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getCurrentUser,
  getSubscriptionStatus,
  updateProfile,
  deleteAccount,
  changePassword,
  getApiErrorMessage,
} from "@/lib/api";
import { logout } from "@/lib/auth-guard";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import PricingModal from "@/components/chat/PricingModal";
import type { UserResponse, SubscriptionStatus } from "@/types";

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

const PLAN_DISPLAY: Record<string, { name: string; icon: IconName; note: string }> = {
  free: { name: "Free 플랜", icon: "leaf", note: "무료" },
  pro: { name: "Pro 플랜", icon: "rocket", note: "유료" },
  max: { name: "Max 플랜", icon: "building-2", note: "유료" },
};

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 수정
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // 업그레이드 모달
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // 회원 탈퇴
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PasswordFormData>();

  const loadAccount = async () => {
    try {
      const [u, s] = await Promise.all([
        getCurrentUser(),
        getSubscriptionStatus().catch(() => null),
      ]);
      setUser(u);
      setSub(s);
    } catch {
      // getCurrentUser 401 시 api 훅이 로그인으로 보냄
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 계정/구독 로드 — 이펙트 본문 동기 setState를 피해 then 체인 사용
  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), getSubscriptionStatus().catch(() => null)])
      .then(([u, s]) => {
        if (!active) return;
        setUser(u);
        setSub(s);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const startEditProfile = () => {
    setEditName(user?.name ?? "");
    setEditPhone(user?.phone ?? "");
    setProfileError(null);
    setIsEditingProfile(true);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const updated = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() === "" ? null : editPhone.trim(),
      });
      setUser(updated);
      setIsEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(await getApiErrorMessage(err, "프로필 수정에 실패했습니다."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      logout();
      router.replace("/auth/login");
    } catch (err) {
      setDeleteError(await getApiErrorMessage(err, "계정 삭제에 실패했습니다."));
      setDeleting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      setPasswordSuccess(true);
      reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(await getApiErrorMessage(err, "비밀번호 변경에 실패했습니다."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const planKey = sub?.plan ?? "free";
  const planInfo = PLAN_DISPLAY[planKey] ?? PLAN_DISPLAY.free;

  return (
    <>
      <TopBar title="설정" subtitle="계정 정보와 플랜을 관리합니다." />

      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
        {/* 프로필 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">프로필</h2>

          {profileSuccess && (
            <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-3 py-3">
              <p className="text-sm text-success-700">프로필이 저장되었습니다.</p>
            </div>
          )}
          {profileError && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-3">
              <p className="text-sm text-error-600">{profileError}</p>
            </div>
          )}

          {loading ? (
            <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ) : isEditingProfile ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-500">이름</label>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름"
                  className="max-w-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">전화번호</label>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="010-1234-5678 (선택)"
                  className="max-w-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button hierarchy="primary" size="md" onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "저장 중..." : "저장"}
                </Button>
                <Button
                  hierarchy="secondary"
                  size="md"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileError(null);
                  }}
                  disabled={savingProfile}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-500">이름</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{user?.name ?? "-"}</p>
                </div>
                <Button hierarchy="secondary" size="md" onClick={startEditProfile}>
                  수정
                </Button>
              </div>
              <div>
                <label className="text-sm text-gray-500">전화번호</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{user?.phone ?? "미등록"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">이메일</label>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                  {user?.email ?? "-"}
                  {user &&
                    (user.email_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                        <Icon name="check" size={12} /> 인증됨
                      </span>
                    ) : (
                      <Link
                        href="/auth/verify-email"
                        className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 hover:bg-warning-100"
                      >
                        미인증 · 인증하기
                      </Link>
                    ))}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">비밀번호 변경</h2>
          {passwordSuccess && (
            <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-3 py-3">
              <p className="text-sm text-success-700">비밀번호가 성공적으로 변경되었습니다.</p>
            </div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-3">
              <p className="text-sm text-error-600">{passwordError}</p>
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
              <Button type="submit" hierarchy="primary" size="md" disabled={passwordLoading}>
                {passwordLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </div>
          </form>
        </Card>

        {/* 플랜 정보 */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">플랜 정보</h2>
          {loading ? (
            <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                    <Icon name={planInfo.icon} size={18} className="text-primary-600" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{sub?.plan_name ?? planInfo.name}</p>
                    <p className="text-xs text-gray-500">
                      {planInfo.note} · 사이트 {sub ? `${sub.sites_used} / ${sub.sites_limit}` : "-"}개
                    </p>
                  </div>
                </div>
              </div>
              {sub?.can_upgrade ? (
                <Button hierarchy="primary" size="md" onClick={() => setIsPricingOpen(true)}>
                  업그레이드
                </Button>
              ) : (
                <span className="text-xs font-medium text-primary-600">최상위 플랜</span>
              )}
            </div>
          )}
        </Card>

        {/* 위험 구역 */}
        <Card className="border-error-200">
          <h2 className="mb-2 font-display text-lg font-semibold text-error-600">위험 구역</h2>
          <p className="mb-4 text-sm text-gray-500">
            계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>

          {deleteError && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-3">
              <p className="text-sm text-error-600">{deleteError}</p>
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-error-50 px-4 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-error-100"
            >
              <Icon name="trash-2" size={16} />
              계정 삭제
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-error-200 bg-error-50/50 p-4">
              <p className="text-sm font-medium text-error-700">
                정말 계정을 삭제하시겠어요? 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-md bg-error-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-error-700 disabled:opacity-60"
                >
                  {deleting ? "삭제 중..." : "영구 삭제"}
                </button>
                <Button
                  hierarchy="secondary"
                  size="md"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelect={() => {}}
        currentPlan={planKey}
        onSuccess={() => {
          setIsPricingOpen(false);
          loadAccount();
        }}
      />
    </>
  );
}
