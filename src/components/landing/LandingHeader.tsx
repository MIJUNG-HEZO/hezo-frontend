import Link from "next/link";
import { Section } from "./Section";
import { Logo } from "./Logo";
import { buttonVariants } from "@/components/ui/button-variants";

const navLinks = [
  { label: "기능", href: "#features" },
  { label: "작동 방식", href: "#how" },
  { label: "요금", href: "#pricing" },
];

export function LandingHeader() {
  return (
    <Section className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-md">
      <header className="flex h-[72px] items-center gap-10">
        <Logo />
        <nav className="flex flex-1 gap-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-sm px-3 py-2 text-[15px] font-semibold text-gray-500 transition-colors hover:text-gray-900"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className={buttonVariants({ hierarchy: "link", className: "px-2" })}
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
