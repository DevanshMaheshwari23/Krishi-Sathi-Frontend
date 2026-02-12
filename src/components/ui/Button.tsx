import type { ButtonHTMLAttributes, FC } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] border border-transparent hover:brightness-105 active:brightness-95 shadow-[var(--shadow-card)]",
  secondary:
    "bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--danger)] text-white border border-transparent hover:brightness-105 active:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button: FC<ButtonProps> = ({
  children,
  className,
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...rest
}) => {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
};
