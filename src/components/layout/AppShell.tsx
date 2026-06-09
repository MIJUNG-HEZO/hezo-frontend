"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/layout/AuthGuard";
import { DashSidebar } from "@/components/layout/DashSidebar";

// Public routes render bare (no app chrome / no auth gate): the marketing
// landing, auth flow, email verification, and standalone site previews.
// Everything else is the authenticated app shell (fixed sidebar + gated main).
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/email-verification") ||
    pathname.startsWith("/preview")
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <DashSidebar />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </AuthGuard>
  );
}
