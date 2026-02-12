import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Card } from "../ui/Card";

export const PageShell = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <main className={cn("page-shell", className)}>{children}</main>;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, badge, actions, className }: PageHeaderProps) => {
  return (
    <section className={cn("hero-panel relative overflow-hidden px-6 py-8 md:px-8 md:py-10", className)}>
      <div className="grid-overlay absolute inset-0" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {badge}
          <h1 className="heading-hero mt-4 text-balance text-[var(--primary-foreground)]">{title}</h1>
          {description ? <p className="mt-3 text-base md:text-lg text-[color-mix(in_srgb,var(--primary-foreground)_84%,white)]">{description}</p> : null}
        </div>
        {actions ? <div className="relative z-10 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, hint, icon, className }: StatCardProps) => {
  return (
    <Card className={cn("surface-card-hover", className)} interactive>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-soft">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{value}</p>
          {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-2 text-[var(--primary)]">{icon}</div> : null}
      </div>
    </Card>
  );
};

export const SectionCard = ({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Card className={className}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
};

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <Card className="py-14 text-center">
      {icon ? <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-soft)]">{icon}</div> : null}
      <h3 className="text-xl font-bold text-[var(--text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
};

export const FilterBar = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <Card className={cn("mb-6", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">{children}</div>
    </Card>
  );
};
