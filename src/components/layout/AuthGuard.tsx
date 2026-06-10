"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-guard";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 인증 페이지 및 이메일 인증 페이지는 가드 스킵
    if (pathname.startsWith("/auth/") || pathname.startsWith("/email-verification")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }

    if (!isAuthenticated()) {
      router.replace("/auth/login");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // 인증 페이지 및 이메일 인증 페이지는 가드 없이 렌더
  if (pathname.startsWith("/auth/") || pathname.startsWith("/email-verification")) {
    return <>{children}</>;
  }

  // 마운트 전 또는 인증 확인 중에는 로딩 표시
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
