interface SidebarCollapseHandleProps {
  collapsed: boolean;
  controls: string;
  onToggle: () => void;
}

/** Divider-mounted desktop toggle shared by the instructor and student shells. */
export function SidebarCollapseHandle({
  collapsed,
  controls,
  onToggle,
}: SidebarCollapseHandleProps) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={!collapsed}
      aria-controls={controls}
      title={label}
      className="absolute z-50 -right-4 top-1/2 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex h-10 w-5 items-center justify-center rounded-full border border-line bg-surface shadow-md transition-colors hover:border-accent/60">
        <span aria-hidden="true" className="flex h-3.5 items-stretch gap-1">
          <span className="w-px rounded-full bg-current" />
          <span className="w-px rounded-full bg-current" />
        </span>
      </span>
    </button>
  );
}
