"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSites, getSubscriptionStatus, getCurrentUser, type SiteSummary } from "@/lib/api";
import { isAuthenticated, logout } from "@/lib/auth-guard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import BillingPanel from "@/components/layout/BillingPanel";
import PricingModal from "@/components/chat/PricingModal";
import { cn } from "@/lib/utils";

type Plan = "free" | "pro" | "max";
type NavItem = { href: string; label: string; icon: IconName; requiresSite?: boolean };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: "layout-dashboard" },
  { href: "/dashboard/ai-score", label: "AI 친화도 점수", icon: "gauge", requiresSite: true },
  { href: "/dashboard/llm-citations", label: "LLM 인용 현황", icon: "quote", requiresSite: true },
  { href: "/dashboard/operations", label: "트래픽 & 유입", icon: "trending-up", requiresSite: true },
  { href: "/dashboard/business-context", label: "사이트 관리", icon: "building-2", requiresSite: true },
];

function SidebarLink({
  href,
  label,
  icon,
  active,
  accent,
}: {
  href: string;
  label: string;
  icon: IconName;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-[9px] text-[14.5px] transition-colors",
        active
          ? "bg-primary-50 font-semibold text-primary-700"
          : accent
            ? "border border-primary-200 font-medium text-primary-700 hover:bg-primary-50"
            : "font-medium text-gray-500 hover:bg-gray-50",
      )}
    >
      <Icon
        name={icon}
        size={20}
        className={active || accent ? "text-primary-600" : "text-gray-400"}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export function DashSidebar({ onHide }: { onHide?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasSite, setHasSite] = useState(false);
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [userName, setUserName] = useState("사용자");
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    getSites()
      .then((list) => {
        const published = list.filter((s) => s.is_published);
        setSites(published);
        setHasSite(published.length > 0);
        const saved = typeof window !== "undefined" ? localStorage.getItem("hezo_active_site") : null;
        setActiveSiteId(published.find((s) => s.id === saved)?.id ?? published[0]?.id ?? null);
      })
      .catch(() => {
        setHasSite(false);
        setSites([]);
      });
    getSubscriptionStatus()
      .then((status) => setPlan(status.plan))
      .catch(() => {});
    getCurrentUser()
      .then((u) => setUserName(u.name))
      .catch(() => {});
  }, [pathname]);

  const planLabel =
    plan === "max" ? "Max 플랜" : plan === "pro" ? "Pro 플랜" : "Free 플랜";

  const activeSite = sites.find((s) => s.id === activeSiteId);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const visibleNav = navItems.filter((i) => !i.requiresSite || hasSite);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <>
      <aside className="flex h-screen w-[280px] flex-none flex-col border-r border-gray-200 bg-white px-4 py-[22px]">
        {/* logo */}
        <div className="flex items-center gap-2.5 px-2 pb-[22px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 shadow-xs">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 1V13M3 7H11M11 1V13"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-extrabold tracking-[-0.02em] text-gray-900">
            HEZO
          </span>
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label="사이드바 숨기기"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <Icon name="chevron-left" size={20} />
            </button>
          )}
        </div>

        {/* site selector — 다중 사이트 시 드롭다운으로 전환 */}
        {hasSite && (
          <div className="relative mb-3.5">
            <button
              type="button"
              onClick={() => sites.length > 1 && setSiteMenuOpen((o) => !o)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-[9px]",
                sites.length > 1 ? "hover:bg-gray-100" : "cursor-default",
              )}
            >
              <Icon name="globe" size={16} className="flex-none text-gray-500" />
              <span className="flex-1 truncate text-left text-sm font-semibold text-gray-700">
                {activeSite?.name ?? "내 사이트"}
              </span>
              {sites.length > 1 && (
                <Icon name="chevron-down" size={16} className="flex-none text-gray-400" />
              )}
            </button>

            {siteMenuOpen && sites.length > 1 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSiteMenuOpen(false)} />
                <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  {sites.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSiteId(s.id);
                        try {
                          localStorage.setItem("hezo_active_site", s.id);
                        } catch {}
                        setSiteMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                        s.id === activeSiteId ? "font-semibold text-primary-700" : "text-gray-600",
                      )}
                    >
                      <Icon
                        name="globe"
                        size={14}
                        className={s.id === activeSiteId ? "text-primary-600" : "text-gray-400"}
                      />
                      <span className="flex-1 truncate">{s.name}</span>
                      {s.id === activeSiteId && (
                        <Icon name="check" size={14} className="flex-none text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* primary nav */}
        <nav className="flex flex-col gap-0.5">
          {visibleNav.map((i) => (
            <SidebarLink key={i.href} {...i} active={isActive(i.href)} />
          ))}
        </nav>

        <div className="my-3.5 h-px bg-gray-200" />

        {/* secondary nav */}
        <div className="flex flex-col gap-0.5">
          <SidebarLink
            href="/dashboard?chat=open"
            label="새 사이트 만들기"
            icon="message-circle"
            accent
          />
          <button
            onClick={() => setIsBillingOpen(true)}
            className="flex items-center gap-3 rounded-md px-3 py-[9px] text-[14.5px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            <Icon name="credit-card" size={20} className="text-gray-400" />
            <span className="flex-1 text-left">결제 및 관리</span>
          </button>
          <SidebarLink
            href="/settings"
            label="설정"
            icon="settings"
            active={isActive("/settings")}
          />
        </div>

        {/* bottom profile */}
        <div className="mt-auto">
          <div className="my-3.5 h-px bg-gray-200" />
          <div className="flex items-center gap-3 px-1">
            <Avatar name={userName} size="md" status="online" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-700">{userName}</div>
              <div className="truncate text-[13px] text-gray-500">{planLabel}</div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="로그아웃"
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <Icon name="log-out" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <BillingPanel
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onUpgrade={(p: string) => {
          setUpgradePlan(p);
          setIsBillingOpen(false);
          setIsPricingOpen(true);
        }}
      />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => {
          setIsPricingOpen(false);
          setUpgradePlan(null);
        }}
        onSelect={() => {
          setIsPricingOpen(false);
          setUpgradePlan(null);
        }}
        targetPlan={upgradePlan as "pro" | "max" | undefined}
      />
    </>
  );
}
