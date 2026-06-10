import { cn } from "@/lib/utils";

export type ButtonHierarchy = "primary" | "secondary" | "tertiary" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

// Shared button styling so both <Button> (interactive) and <Link>/<a>
// (navigation, usable in server components) render identically.
export const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring-brand)] disabled:opacity-50 disabled:pointer-events-none";

// Emerald button states: 500 base → 600 hover → 700 active (HEZO brand).
export const buttonHierarchies: Record<ButtonHierarchy, string> = {
  primary:
    "bg-primary-500 text-white shadow-button-primary hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "bg-white text-gray-700 border border-gray-300 shadow-button-secondary hover:bg-gray-50",
  tertiary: "bg-transparent text-gray-600 hover:bg-gray-50",
  link: "bg-transparent p-0 text-primary-700 hover:text-primary-800",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-3.5 py-2.5 text-sm",
  lg: "px-4 py-2.5 text-base",
  xl: "px-[18px] py-3 text-base",
};

export function buttonVariants({
  hierarchy = "primary",
  size = "md",
  className,
}: {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    buttonBase,
    buttonHierarchies[hierarchy],
    hierarchy !== "link" && buttonSizes[size],
    className,
  );
}
