import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function InstructorStatCard({
  label,
  value,
  detail,
  Icon,
}: {
  label: string;
  value: number;
  detail: string;
  Icon: LucideIcon;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">{detail}</p>
    </article>
  );
}

export function InstructorDashboardSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
