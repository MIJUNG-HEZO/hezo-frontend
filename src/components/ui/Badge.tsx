import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "brand" | "gray" | "success" | "error" | "warning";
type BadgeSize = "sm" | "md" | "lg";

const colors: Record<BadgeColor, { bg: string; text: string; dot: string }> = {
  brand: { bg: "bg-primary-50", text: "text-primary-700", dot: "bg-primary-500" },
  gray: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  success: { bg: "bg-success-50", text: "text-success-700", dot: "bg-success-500" },
  error: { bg: "bg-error-50", text: "text-error-700", dot: "bg-error-500" },
  warning: { bg: "bg-warning-50", text: "text-warning-700", dot: "bg-warning-500" },
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-sm",
};

export function Badge({
  color = "gray",
  size = "md",
  dot = false,
  className,
  children,
}: {
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const c = colors[color];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        c.bg,
        c.text,
        sizes[size],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />}
      {children}
    </span>
  );
}
