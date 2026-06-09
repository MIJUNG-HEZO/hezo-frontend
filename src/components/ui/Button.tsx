"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import {
  buttonVariants,
  type ButtonHierarchy,
  type ButtonSize,
} from "./button-variants";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    hierarchy = "primary",
    size = "md",
    iconLeading,
    iconTrailing,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ hierarchy, size, className })}
      {...props}
    >
      {iconLeading}
      {children}
      {iconTrailing}
    </button>
  );
});
