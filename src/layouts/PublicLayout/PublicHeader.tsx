import { ArrowUpRight, Terminal } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ThemeToggle } from "../../features/theme/ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/cohorts", label: "Live cohorts" },
  { to: "/playground", label: "Playground" },
];

export function PublicHeader() {
  const { profile } = useAuth();

  return (
    <header className="relative border-b border-line bg-surface/40">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 px-5 sm:px-8 lg:px-10"
      >
        <Link
          to="/"
          aria-label="Logixia home"
          className="flex shrink-0 items-center gap-2 py-5 sm:gap-3 text-foreground"
        >
          <img
            src="/logixialogo.webp"
            alt=""
            className="size-10 shrink-0 object-contain sm:size-14"
          />
          <span className="flex flex-col">
            <span className="text-xl font-bold sm:text-2xl leading-none tracking-tight">
              Logixia<span className="text-cyan-500">.</span>
            </span>
            <span className="mt-2 hidden text-[9px] sm:block font-semibold tracking-[0.22em] text-muted">
              LEARN. PRACTISE. BUILD.
            </span>
          </span>
        </Link>

        <div className="order-3 flex w-full items-stretch justify-center gap-6 border-t border-line text-[13px] font-semibold sm:gap-8 lg:order-none lg:w-auto lg:self-stretch lg:border-0">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              state={to === "/playground" ? { fromPublic: true } : undefined}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex items-center py-4 transition-colors focus-visible:outline-2 focus-visible:outline-accent lg:py-0 ${isActive ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-cyan-500" : "text-muted hover:text-foreground"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <span
            aria-hidden="true"
            className="hidden h-5 w-px bg-line sm:block"
          />
          <Link
            to={profile ? "/" : "/auth/login"}
            state={profile ? undefined : { fromPublic: true }}
            className="rounded-md py-2 text-sm font-semibold text-body transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            {profile ? "My learning" : "Log in"}
          </Link>
          <Link
            to="/playground"
            state={{ fromPublic: true }}
            className="hidden items-center gap-2.5 rounded-lg border border-emerald-400/30 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:inline-flex"
          >
            <Terminal size={17} aria-hidden="true" />
            Try playground
            <ArrowUpRight size={14} aria-hidden="true" className="opacity-70" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
