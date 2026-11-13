import { Menu, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { homeLinks, homeSections } from "../config";
import { Logo, buttonStyles } from "../shared";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled || open || !isHome
          ? "border-line bg-canvas/85 backdrop-blur-md"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
        {isHome ? (
          <a href="#top" aria-label="Logixia Academy home">
            <Logo />
          </a>
        ) : (
          <Link to="/" aria-label="Logixia Academy home">
            <Logo />
          </Link>
        )}

        <nav
          aria-label="Main"
          className="hidden flex-1 items-center gap-1 lg:flex"
        >
          {homeSections.map((s) =>
            isHome ? (
              <a key={s.id} href={`#${s.id}`} className={buttonStyles.ghost}>
                {s.label}
              </a>
            ) : (
              <Link
                key={s.id}
                to={`/#${s.id}`}
                className={buttonStyles.ghost}
              >
                {s.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden items-center gap-2 sm:flex">
            <Link
              to={homeLinks.signIn}
              state={{ fromPublic: true }}
              className={buttonStyles.ghost}
            >
              Sign in
            </Link>
            <Link
              to={homeLinks.playground}
              state={{ fromPublic: true }}
              className={`${buttonStyles.primary} !py-2`}
            >
              <Play size={15} aria-hidden="true" />
              Try the playground
            </Link>
          </span>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-lg text-body hover:bg-hover lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-line px-5 pb-5 pt-3 lg:hidden"
        >
          <div className="flex flex-col">
            {homeSections.map((s) =>
              isHome ? (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-body hover:bg-hover hover:text-foreground"
                >
                  {s.label}
                </a>
              ) : (
                <Link
                  key={s.id}
                  to={`/#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-body hover:bg-hover hover:text-foreground"
                >
                  {s.label}
                </Link>
              ),
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to={homeLinks.signIn}
              state={{ fromPublic: true }}
              className={buttonStyles.secondary}
            >
              Sign in
            </Link>
            <Link
              to={homeLinks.playground}
              state={{ fromPublic: true }}
              className={buttonStyles.primary}
            >
              Playground
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
