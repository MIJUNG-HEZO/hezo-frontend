import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Centered marketing section: full-bleed background, 1216px max content, 32px gutters.
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("flex w-full justify-center", className)}>
      <div className="w-full max-w-[1216px] px-8">{children}</div>
    </section>
  );
}
