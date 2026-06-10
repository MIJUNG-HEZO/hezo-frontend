import type { ReactNode } from "react";

// Sticky page header inside the scrolling app content area.
export function TopBar({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-200 bg-white/90 px-5 py-4 pl-16 backdrop-blur-md sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:px-8 lg:py-[22px]">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-gray-900 sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-[5px] max-w-[640px] text-sm text-gray-500 [word-break:keep-all]">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 sm:flex-none">{children}</div>
      )}
    </header>
  );
}
