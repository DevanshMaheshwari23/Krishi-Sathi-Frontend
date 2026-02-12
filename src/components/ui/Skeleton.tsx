import { cn } from "../../lib/cn";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--surface-strong)_68%,transparent)]",
        className
      )}
    />
  );
};
