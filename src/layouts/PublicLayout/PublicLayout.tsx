import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "../../features/theme/ThemeProvider";
import { HomeHeader } from "../../features/home/components/HomeHeader";
import { PublicFooter } from "./PublicFooter";
import "../../features/home/home.css";

export function PublicLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <ThemeProvider>
      <div
        data-public-home={pathname === "/" ? "true" : undefined}
        className="flex min-h-dvh flex-col bg-canvas text-body selection:bg-accent/20"
      >
        <a
          href="#public-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3 focus:text-foreground"
        >
          Skip to content
        </a>
        <HomeHeader />
        <main
          id="public-content"
          className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16"
        >
          <div key={pathname} className="public-page-enter">
            <Outlet />
          </div>
        </main>
        <PublicFooter />
      </div>
    </ThemeProvider>
  );
}
