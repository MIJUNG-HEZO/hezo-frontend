"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth-guard";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import BillingPanel from "@/components/layout/BillingPanel";
import PricingModal from "@/components/chat/PricingModal";
import type { UserResponse } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  requiresSite?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "대시보드", icon: "📊" },
  { href: "/dashboard/ai-score", label: "AI 친화도 점수", icon: "🎯", requiresSite: true },
  { href: "/dashboard/llm-citations", label: "LLM 인용 현황", icon: "🔗", requiresSite: true },
  { href: "/dashboard/operations", label: "트래픽 & 유입", icon: "📈", requiresSite: true },
  { href: "/dashboard/business-context", label: "사이트 관리", icon: "🏢", requiresSite: true },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);

  // API에서 가져온 유저/사이트 정보
  const [hasSite, setHasSite] = useState(false);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);

  // 마운트 시 + pathname 변경 시 유저/사이트 정보 fetch
  useEffect(() => {
    if (!isAuthenticated()) return;

    // 사이트 목록 확인 (published 상태만 발급됨으로 간주)
    api.get("api/v1/sites").json<{ id: string; status: string }[]>()
      .then((sites) => setHasSite(sites.some((s) => s.status === "published")))
      .catch(() => setHasSite(false));

    // 유저 정보 확인
    api.get("api/v1/auth/me").json<UserResponse>()
      .then((user) => setUserInfo(user))
      .catch(() => setUserInfo(null));
  }, [pathname]);

  // 인증 페이지에서는 사이드바 숨김
  if (pathname.startsWith("/auth/")) return null;

  const filteredNav = navItems.filter((item) => {
    if (item.requiresSite && !hasSite) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/auth/login");
  };

  const handleBillingUpgrade = (targetPlan: string) => {
    setUpgradePlan(targetPlan);
    setIsBillingOpen(false);
    setIsPricingOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePricingSelect = (_plan: string) => {
    setIsPricingOpen(false);
    setUpgradePlan(null);
  };

  return (
    <>
      {/* 좌상단 고정 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* 오버레이 (열렸을 때) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => { setIsOpen(false); setShowProfileMenu(false); }}
        />
      )}

      {/* 사이드바 드롭다운 패널 */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* 로고 + 닫기 */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">HEZO</h1>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* 사이트 셀렉터 */}
        {hasSite && (
          <div className="px-4 py-3 border-b border-gray-100">
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
              <span className="text-xs">🌐</span>
              <span>내 사이트</span>
              <span className="ml-auto text-gray-400">▾</span>
            </button>
          </div>
        )}

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* 새 사이트 만들기 (항상 표시) */}
          <Link
            href="/?chat=open"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-green-600 hover:bg-green-50 mt-2 border border-green-200"
          >
            <span className="text-base">💬</span>
            <span>새 사이트 만들기</span>
          </Link>

          {/* 결제 및 관리 */}
          <button
            onClick={() => {
              setIsBillingOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 mt-2"
          >
            <span className="text-base">💳</span>
            <span>결제 및 관리</span>
          </button>
        </nav>

        {/* 하단 프로필 */}
        <div className="relative p-4 border-t border-gray-100">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-medium">
              {userInfo?.name?.[0] || "H"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.name || "사용자"}</p>
              <p className="text-xs text-gray-400 truncate">{userInfo?.email || ""}</p>
            </div>
            <span className="text-gray-400 text-xs">{showProfileMenu ? "▴" : "▾"}</span>
          </button>

          {/* 프로필 드롭업 메뉴 */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] text-gray-400">현재 플랜</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">
                  {userInfo?.plan === "enterprise" && "🏢 Enterprise"}
                  {userInfo?.plan === "pro" && "🚀 Pro"}
                  {(!userInfo?.plan || userInfo?.plan === "starter") && "🌱 Starter"}
                </p>
              </div>

              <div className="p-2 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50">🚪 로그아웃</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* BillingPanel */}
      <BillingPanel
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onUpgrade={handleBillingUpgrade}
      />

      {/* PricingModal (업그레이드 시) */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => {
          setIsPricingOpen(false);
          setUpgradePlan(null);
        }}
        onSelect={handlePricingSelect}
        targetPlan={upgradePlan as "pro" | "enterprise" | undefined}
      />
    </>
  );
}
