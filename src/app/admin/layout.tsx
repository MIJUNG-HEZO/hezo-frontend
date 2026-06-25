"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth/login");
      return;
    }
    getCurrentUser()
      .then((u) => {
        if (u.role !== "admin") {
          router.replace("/dashboard");
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
