import { ArrowUpRight, Terminal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { useEffect, useState } from "react";

interface NavSection {
  id: string;
  label: string;
  to: string;
  isTab?: boolean;
}

const navSections: NavSection[] = [
  { id: "home", label: "Home", to: "/#home" },
  { id: "learning", label: "Courses", to: "/#learning" },
  { id: "classroom", label: "Live cohorts", to: "/#classroom" },
  { id: "playground", label: "Playground", to: "/playground", isTab: true },
];

export function PublicHeader() {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const [activeSection, setActiveSection] = useState<string>("home");

  // Track active section on landing page scroll
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = ["home", "learning", "classroom"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          return;
        }
      }
      setActiveSection("home");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: NavSection,
  ) => {
    if (section.isTab) return;

    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(section.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${section.id}`);
      } else if (section.id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 px-5 sm:px-8 lg:px-10"
      >
        <Link
          to="/#home"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.history.pushState(null, "", "/");
            }
          }}
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
          {navSections.map((section) => {
            const isCurrentActive =
              pathname === "/"
                ? activeSection === section.id
                : pathname === section.to;

            return (
              <Link
                key={section.id}
                to={section.to}
                state={section.isTab ? { fromPublic: true } : undefined}
                onClick={(e) => handleNavClick(e, section)}
                className={`relative flex items-center py-4 transition-colors focus-visible:outline-2 focus-visible:outline-accent lg:py-0 ${
                  section.isTab
                    ? "text-muted hover:text-foreground"
                    : isCurrentActive
                      ? "text-foreground font-semibold"
                      : "text-muted hover:text-foreground"
                }`}
              >
                {section.label}
              </Link>
            );
          })}
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
