import { NavLink, useLocation } from "react-router-dom";
import { Home, GraduationCap, BookOpen, Terminal, Menu } from "lucide-react";

// Pages where the bar should get out of the way (editor needs the space)
const HIDDEN_ON = ["/playground", "/lessons"];

export function useShowBottomNav() {
  const { pathname } = useLocation();
  return !HIDDEN_ON.some((p) => pathname.startsWith(p));
}

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/cohorts", label: "Programs", icon: GraduationCap },
  { to: "/courses", label: "courses", icon: BookOpen },
  { to: "/playground", label: "Playground", icon: Terminal },
];

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const show = useShowBottomNav();
  if (!show) return null;

  const base = "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#30363d] bg-[#161b22] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${base} ${isActive ? "text-[#58a6ff]" : "text-[#8b949e]"}`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        <button onClick={onMoreClick} className={`${base} text-[#8b949e]`}>
          <Menu size={20} />
          More
        </button>
      </div>
    </nav>
  );
}