import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function DashboardCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#30363d] bg-[#161b22] p-5 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function SeeAllLink({ to = "/assignments" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="text-xs text-[#8b949e] underline-offset-2 hover:text-white hover:underline"
    >
      See all
    </Link>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-[#8b949e]">{children}</p>;
}