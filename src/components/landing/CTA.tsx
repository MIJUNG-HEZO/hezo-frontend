import Link from "next/link";
import { Section } from "./Section";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

export function CTA() {
  return (
    <Section className="py-24">
      <div className="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--color-primary-600),var(--color-primary-900))] px-14 py-[72px] text-center">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 28%, #fff 0, transparent 36%), radial-gradient(circle at 82% 72%, #fff 0, transparent 32%)",
          }}
        />
        <h2
          className={`relative max-w-[640px] font-display text-[40px] font-bold tracking-[-0.02em] text-white ${kr}`}
        >
          AI 검색 시대, 가장 먼저 준비하세요
        </h2>
        <p className={`relative max-w-[520px] text-lg text-white/85 ${kr}`}>
          첫 사이트는 무료입니다. 신용카드 없이 지금 바로 챗봇과 대화를 시작해 보세요.
        </p>
        <div className="relative mt-1.5 flex gap-3">
          <Link
            href="/auth/login"
            className={buttonVariants({ hierarchy: "secondary", size: "xl" })}
          >
            도입 문의
          </Link>
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ size: "xl" }),
              "bg-white text-primary-700 shadow-button-secondary hover:bg-white/90 active:bg-white",
            )}
          >
            무료로 시작하기
            <Icon name="arrow-right" size={18} className="text-primary-700" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
