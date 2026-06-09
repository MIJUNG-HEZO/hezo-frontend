"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  padding = 24,
  className,
  style,
  onClick,
}: {
  children: ReactNode;
  padding?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ padding, ...style }}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-xs",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
