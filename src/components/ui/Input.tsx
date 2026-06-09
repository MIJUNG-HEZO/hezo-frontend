"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border bg-white px-3.5 py-2.5 text-base text-gray-900 shadow-button-secondary transition-colors placeholder:text-gray-400 focus:outline-none focus-visible:ring-4 disabled:bg-gray-50 disabled:text-gray-500",
        invalid
          ? "border-error-300 focus-visible:border-error-400 focus-visible:ring-[var(--focus-ring-error)]"
          : "border-gray-300 focus-visible:border-primary-400 focus-visible:ring-[var(--focus-ring-brand)]",
        className,
      )}
      {...props}
    />
  );
});
