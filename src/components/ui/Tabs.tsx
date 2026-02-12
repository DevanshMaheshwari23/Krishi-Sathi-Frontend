import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TabItem<T extends string> {
  key: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const Tabs = <T extends string>({ tabs, value, onChange, className }: TabsProps<T>) => {
  return (
    <div className={cn("inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-1", className)}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[calc(var(--radius-md)-4px)] px-3 py-1.5 text-sm font-semibold transition",
              active
                ? "bg-[var(--surface)] text-[var(--text)] shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
