"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "파이프라인 현황" },
  { href: "/admin/agents", label: "에이전트 상태" },
  { href: "/admin/users", label: "사용자 목록" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("access_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <span className="text-sm font-bold text-gray-900">HEZO Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === n.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
