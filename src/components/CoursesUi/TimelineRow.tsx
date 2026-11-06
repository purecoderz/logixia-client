import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface TimelineRowProps {
  node: ReactNode;
  title: string;
  to?: string;
  badge?: string;
  trailing?: ReactNode;
}

export function TimelineRow({ node, title, to, badge, trailing }: TimelineRowProps) {
  return (
    <Link
      to={to?to:""}
      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2a44] text-xs text-body group-hover:bg-[#2a3a5e]">
        {node}
      </span>

      <span className="flex-1 truncate text-sm text-body group-hover:text-foreground">
        {title}
        {badge && (
          <span className="ml-2 rounded bg-hover px-1.5 py-0.5 text-[10px] text-muted">
            {badge}
          </span>
        )}
      </span>

      {trailing}
    </Link>
  );
}