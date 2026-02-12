import type { FC, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select: FC<SelectProps> = ({ label, error, className, id, children, ...rest }) => {
  const selectId = id ?? rest.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <select id={selectId} className={cn("field-base", error && "border-[var(--danger)]", className)} {...rest}>
        {children}
      </select>
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
};
