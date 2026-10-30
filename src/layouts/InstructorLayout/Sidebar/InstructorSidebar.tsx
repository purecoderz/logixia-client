import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, X } from "lucide-react";
import { instructorNav, type InstructorNavItem } from "../navConfig";
import { useAuth } from "../../../features/auth/context/AuthContext";


const row =
  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]";
const on = "border border-[#30363d] bg-[#0d1117]  font-semibold text-white";
const off = "text-[#8b949e] hover:bg-[#21262d]/60 hover:text-white";

function Accent() {
  return <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-[#1f6feb]" />;
}

function Item({ item }: { item: InstructorNavItem }) {
  const { pathname } = useLocation();
  const inside = pathname.startsWith(item.path) && item.path !== "/instructor";
  const [open, setOpen] = useState(inside);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`${row} w-full ${inside ? "text-white" : off}`}
        >
          <Icon size={18} aria-hidden />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown size={16} aria-hidden className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
        {open && (
          <div className="ml-5 mt-1 space-y-1 border-l border-[#30363d] pl-3">
            {item.children.map((c) => (
              <NavLink
                key={c.id}
                to={c.path}
                end
                className={({ isActive }) => `${row} py-2 ${isActive ? on : off}`}
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
    <NavLink to={item.path} end className={({ isActive }) => `${row} ${isActive ? on : off}`}>
      {({ isActive }) => (
        <>
          {isActive && <Accent />}
          <Icon size={18} aria-hidden />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function InstructorSidebar({ onClose }: { onClose?: () => void }) {
  const { profile, logout } = useAuth();

  return (
    <div className="flex h-full w-72 flex-col border-r border-[#30363d] bg-[#161b22]">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#30363d] px-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#58a6ff] font-bold text-white">L</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold text-white">Logixia Academy</p>
          <p className="text-xs text-[#58a6ff]">Instructor Portal</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-[#8b949e] hover:text-white">
            <X size={18} aria-hidden />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Instructor">
        {instructorNav.map((s) => (
          <div key={s.title} className="space-y-1">
            <h3 className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">
              {s.title}
            </h3>
            {s.items.map((i) => (
              <Item key={i.id} item={i} />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-3 border-t border-[#30363d] p-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#21262d] text-sm font-bold uppercase text-white">
          {profile?.username.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-white">{profile?.username}</p>
          <p className="text-xs text-[#8b949e]">Instructor</p>
        </div>
        <button type="button" onClick={logout} aria-label="Log out" className="rounded-md p-1.5 text-[#8b949e] hover:text-[#f85149]">
          <LogOut size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}