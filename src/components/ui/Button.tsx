"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--foreground)] text-white hover:bg-black",
  secondary:
    "border border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--foreground)]",
  ghost: "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
  danger: "bg-[#b33a2f] text-white hover:bg-[#982f27]",
};

export function Button({
  className,
  icon,
  children,
  variant = "secondary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
