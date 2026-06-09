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
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white/90 px-8 py-[22px] backdrop-blur-md">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-[5px] max-w-[640px] text-sm text-gray-500 [word-break:keep-all]">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-none items-center gap-2.5">{children}</div>
      )}
    </header>
  );
}
