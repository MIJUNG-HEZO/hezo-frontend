"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUserState, getRedirectPath, type UserState } from "@/lib/auth-guard";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<UserState | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const userState = getUserState();
    setState(userState);

    const redirect = getRedirectPath(userState, pathname);
    if (redirect) {
      router.replace(redirect);
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // 인증 페이지는 가드 없이 렌더
  if (pathname.startsWith("/auth/")) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
}
