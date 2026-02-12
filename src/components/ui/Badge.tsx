import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "info" | "danger";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]",
  success: "bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_36%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_36%,transparent)]",
  info: "bg-[color-mix(in_srgb,var(--info)_18%,transparent)] text-[var(--info)] border-[color-mix(in_srgb,var(--info)_36%,transparent)]",
  danger: "bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_36%,transparent)]",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ className, variant = "default", ...rest }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold",
      variantStyles[variant],
      className
    )}
    {...rest}
  />
);
