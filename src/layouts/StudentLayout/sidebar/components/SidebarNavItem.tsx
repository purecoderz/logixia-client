import React, { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { NavItem } from "../../navConfig";

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
}) => {
  const { pathname } = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const hasActiveChild = Boolean(
    item.children?.some(
      (child) =>
        pathname === child.path || pathname.startsWith(`${child.path}/`),
    ),
  );
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  const iconNode = (
    <div className="relative flex items-center justify-center shrink-0">
      <span className="text-base leading-none">{item.icon}</span>
      {item.isLivePulse && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
      )}
    </div>
  );

  if (hasChildren && item.children) {
    if (isCollapsed) {
      return (
        <Popover>
          <PopoverButton
            aria-label={item.label}
            title={item.label}
            className={`group relative flex w-full items-center justify-center rounded-xl py-2.5 px-0 font-mono text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              hasActiveChild
                ? "border border-line bg-input text-foreground shadow-sm"
                : "text-muted hover:bg-hover/60 hover:text-foreground"
            }`}
          >
            {iconNode}
          </PopoverButton>
          <PopoverPanel
            anchor="right start"
            data-learning-shell-overlay
            className="z-[60] min-w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-2 font-mono text-xs text-body shadow-xl [--anchor-gap:12px]"
          >
            {({ close }) => (
              <div className="space-y-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {item.label}
                </p>
                {item.children!.map((child) => {
                  const childActive =
                    pathname === child.path ||
                    pathname.startsWith(`${child.path}/`);
                  return (
                    <Link
                      key={child.id}
                      to={child.path}
                      onClick={() => close()}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs font-medium transition-colors ${
                        childActive
                          ? "border border-line bg-input text-foreground shadow-sm"
                          : "text-muted hover:bg-hover/60 hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">{child.label}</span>
                      {child.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tight shrink-0 ${
                            child.badgeStyle ||
                            "bg-surface-muted/50 text-body border-line"
                          }`}
                        >
                          {child.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </PopoverPanel>
        </Popover>
      );
    }

    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={item.label}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs font-medium transition-all ${
            hasActiveChild
              ? "text-foreground"
              : "text-muted hover:bg-hover/60 hover:text-foreground"
          }`}
        >
          {iconNode}
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown
            size={15}
            aria-hidden
            className={`shrink-0 text-muted transition-transform duration-200 ${
              open ? "" : "-rotate-90"
            }`}
          />
        </button>

        {open && (
          <div className="ml-5 mt-1 space-y-1 border-l border-line pl-3">
            {item.children.map((child) => {
              const childActive =
                pathname === child.path ||
                pathname.startsWith(`${child.path}/`);
              return (
                <Link
                  key={child.id}
                  to={child.path}
                  aria-label={child.label}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-mono text-xs font-medium transition-all ${
                    childActive
                      ? "border border-line bg-input text-foreground shadow-sm"
                      : "text-muted hover:bg-hover/60 hover:text-foreground"
                  }`}
                >
                  <span className="truncate">{child.label}</span>
                  {child.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tight shrink-0 ml-2 ${
                        child.badgeStyle ||
                        "bg-surface-muted/50 text-body border-line"
                      }`}
                    >
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      title={isCollapsed ? item.label : undefined}
      aria-label={item.label}
      className={`group relative flex w-full items-center rounded-xl py-2.5 font-mono text-xs font-medium transition-all ${
        isCollapsed ? "justify-center px-0" : "gap-3 px-3"
      } ${
        isActive
          ? "border border-line bg-input text-foreground shadow-sm"
          : "text-muted hover:bg-hover/60 hover:text-foreground"
      }`}
    >
      {iconNode}

      {/* Label & Badge */}
      {!isCollapsed && (
        <div className="flex items-center justify-between w-full min-w-0">
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tight shrink-0 ml-2 ${
                item.badgeStyle || "bg-surface-muted/50 text-body border-line"
              }`}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
