import type { FC, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: FC<TextareaProps> = ({ label, error, className, id, ...rest }) => {
  const textareaId = id ?? rest.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="field-label">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={cn("field-base min-h-24 resize-y", error && "border-[var(--danger)]", className)} {...rest} />
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
};
