import Link from "next/link";
import { Section } from "./Section";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/button-variants";

const kr = "[word-break:keep-all] [text-wrap:pretty]";

export function CTA() {
  return (
    <Section className="py-24">
      <div className="flex flex-col items-center gap-[22px] rounded-2xl bg-surface-card px-14 py-[72px] text-center">
        <h2
          className={`max-w-[640px] font-display text-[40px] font-bold tracking-[-0.04em] text-gray-900 ${kr}`}
        >
          AI 검색 시대, 가장 먼저 준비하세요
        </h2>
        <p className={`max-w-[520px] text-lg text-gray-500 ${kr}`}>
          첫 사이트는 무료입니다. 신용카드 없이 지금 바로 챗봇과 대화를 시작해 보세요.
        </p>
        <div className="mt-1.5 flex gap-3">
          <Link href="/auth/login" className={buttonVariants({ hierarchy: "secondary", size: "xl" })}>
            도입 문의
          </Link>
          <Link href="/auth/login" className={buttonVariants({ hierarchy: "primary", size: "xl" })}>
            무료로 시작하기
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
