"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthGuard from "@/components/layout/AuthGuard";
import { DashSidebar } from "@/components/layout/DashSidebar";
import { cn } from "@/lib/utils";

// Public routes render bare (no app chrome / no auth gate): the marketing
// landing, auth flow, email verification, standalone previews, billing result.
// Everything else is the authenticated app shell (sidebar + gated main).
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/oauth") ||
    pathname.startsWith("/email-verification") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/billing")
  );
}

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-lg bg-primary-500 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 14 14" fill="none">
        <path
          d="M3 1V13M3 7H11M11 1V13"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 데스크톱: 사이드바 숨김 토글(#3). 모바일: 오프캔버스 드로어(#8).
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  const hideSidebar = () => {
    setDesktopCollapsed(true);
    setMobileOpen(false);
  };
  const showSidebar = () => {
    setDesktopCollapsed(false);
    setMobileOpen(true);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen">
        {/* 모바일 드로어 backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* 사이드바: 모바일=고정 오프캔버스, lg=정적(숨김 시 lg:hidden) */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            desktopCollapsed && "lg:hidden",
          )}
        >
          <DashSidebar onHide={hideSidebar} />
        </div>

        <main className="relative flex-1 overflow-auto bg-white">
          {/* 사이드바가 숨겨졌을 때 보이는 복원 버튼(HEZO 로고) */}
          <button
            type="button"
            onClick={showSidebar}
            aria-label="사이드바 열기"
            className={cn(
              "fixed left-4 top-4 z-30 items-center gap-2 rounded-xl border border-gray-200 bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur transition-colors hover:bg-gray-50",
              mobileOpen ? "hidden" : "flex",
              desktopCollapsed ? "lg:flex" : "lg:hidden",
            )}
          >
            <LogoMark size={28} />
            <span className="hidden font-display text-base font-extrabold tracking-[-0.02em] text-gray-900 lg:inline">
              HEZO
            </span>
          </button>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
