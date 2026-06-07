"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-guard";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/auth/");
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!isAuthPage && !authenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthPage, authenticated, router]);

  // 인증 페이지는 가드 없이 렌더
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
}
