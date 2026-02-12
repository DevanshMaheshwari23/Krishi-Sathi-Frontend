import type { FC, InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: FC<InputProps> = ({ label, error, hint, className, id, ...rest }) => {
  const inputId = id ?? rest.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <input id={inputId} className={cn("field-base", error && "border-[var(--danger)]", className)} {...rest} />
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : hint ? <p className="text-xs text-soft">{hint}</p> : null}
    </div>
  );
};
