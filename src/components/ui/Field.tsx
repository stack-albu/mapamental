import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  hint,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="font-semibold text-[var(--foreground)]">{label}</span>
      <input
        className="min-h-10 rounded-lg border border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] px-3 text-sm outline-none transition focus:border-[var(--foreground)]"
        {...props}
      />
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="font-semibold text-[var(--foreground)]">{label}</span>
      <textarea
        className="min-h-24 resize-none rounded-lg border border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm outline-none transition focus:border-[var(--foreground)]"
        {...props}
      />
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}
