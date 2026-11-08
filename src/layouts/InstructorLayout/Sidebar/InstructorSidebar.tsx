import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, X } from "lucide-react";
import { instructorNav, type InstructorNavItem } from "../navConfig";
import { useAuth } from "../../../features/auth/context/AuthContext";

const row =
  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";
const on = "border border-line bg-input  font-semibold text-foreground";
const off = "text-muted hover:bg-hover/60 hover:text-foreground";

function Accent() {
  return (
    <span
      aria-hidden
      className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-accent"
    />
  );
}

function Item({
  item,
  collapsed = false,
}: {
  item: InstructorNavItem;
  collapsed?: boolean;
}) {
  const { pathname } = useLocation();
  const inside = pathname.startsWith(item.path) && item.path !== "/instructor";
  const [open, setOpen] = useState(inside);
  const icon = (
    <span aria-hidden="true" className="shrink-0 text-xl leading-none">
      {item.icon}
    </span>
  );

  if (collapsed) {
    const iconClass = `flex min-h-11 w-full items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${inside || pathname === item.path ? on : off}`;
    if (item.children)
      return (
        <Popover>
          <PopoverButton
            aria-label={item.label}
            title={item.label}
            className={iconClass}
          >
            {icon}
          </PopoverButton>
          <PopoverPanel
            anchor="right start"
            data-learning-shell-overlay
            className="z-[60] min-w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-2 text-sm text-body shadow-xl [--anchor-gap:12px]"
          >
            {({ close }) => (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-muted">
                  {item.label}
                </p>
                {item.children!.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    end
                    onClick={() => close()}
                    className={({ isActive }) =>
                      `${row} ${isActive ? on : off}`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </>
            )}
          </PopoverPanel>
        </Popover>
      );
    return (
      <NavLink
        to={item.path}
        end
        aria-label={item.label}
        title={item.label}
        className={iconClass}
      >
        {icon}
      </NavLink>
    );
  }

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`${row} w-full ${inside ? "text-foreground" : off}`}
        >
          {icon}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            size={16}
            aria-hidden
            className={`transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>
        {open && (
          <div className="ml-5 mt-1 space-y-1 border-l border-line pl-3">
            {item.children.map((c) => (
              <NavLink
                key={c.id}
                to={c.path}
                end
                className={({ isActive }) =>
                  `${row} py-2 ${isActive ? on : off}`
                }
              >
                {c.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive }) => `${row} ${isActive ? on : off}`}
    >
      {({ isActive }) => (
        <>
          {isActive && <Accent />}
          {icon}
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-success">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function InstructorSidebar({
  onClose,
  collapsed = false,
}: {
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const { profile, logout } = useAuth();

  return (
    <div
      data-instructor-sidebar
      className="flex h-full min-h-0 w-full flex-col bg-surface"
    >
      <div
        className={`flex h-16 shrink-0 items-center gap-3 border-b border-line ${collapsed ? "justify-center px-2" : "px-4"}`}
      >
        <img
          src="/logixialogo.webp"
          alt=""
          className="size-9 shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-foreground">
              Logixia Academy
            </p>
            <p className="text-xs text-accent">Instructor Portal</p>
          </div>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-muted hover:text-foreground"
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>

      <nav
        className="min-h-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-5"
        aria-label="Instructor"
      >
        {instructorNav.map((s) => (
          <div key={s.title} className="space-y-1">
            <h3
              className={`${collapsed ? "sr-only" : ""} px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted`}
            >
              {s.title}
            </h3>
            {s.items.map((i) => (
              <Item key={i.id} item={i} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div
        className={`flex shrink-0 items-center gap-3 border-t border-line ${collapsed ? "flex-col px-2 py-3" : "p-4"}`}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-hover text-sm font-bold uppercase text-foreground">
          {profile?.username.charAt(0)}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile?.username}
            </p>
            <p className="text-xs text-muted">Instructor</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className="rounded-md p-1.5 text-muted hover:text-[#f85149]"
        >
          <LogOut size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
