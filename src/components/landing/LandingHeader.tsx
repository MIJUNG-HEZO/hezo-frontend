import Link from "next/link";
import { Section } from "./Section";
import { buttonVariants } from "@/components/ui/button-variants";

const navLinks = [
  { label: "기능", href: "#features" },
  { label: "작동 방식", href: "#how" },
  { label: "요금제", href: "#pricing" },
];

export function LandingHeader() {
  return (
    <Section className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <header className="flex h-[72px] items-center gap-10">
        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>

        <nav className="flex flex-1 gap-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-[15px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-2 text-[15px] font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            로그인
          </Link>
          <Link href="/auth/login" className={buttonVariants({ hierarchy: "primary" })}>
            무료로 시작하기
          </Link>
        </div>
      </header>
    </Section>
  );
}
