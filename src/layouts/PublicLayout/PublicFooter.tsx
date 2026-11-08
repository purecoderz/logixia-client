import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./public-footer.css";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="-mb-px block h-10 w-full sm:h-16"
      >
        <path
          d="M0 38C240 82 420 4 720 30C1020 56 1200 76 1440 24V80H0Z"
          fill="var(--footer-background)"
        />
      </svg>
      <div className="bg-[var(--footer-background)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 py-10 sm:grid-cols-[1fr_auto_auto] sm:gap-12 sm:py-12">
            <div>
              <Link
                to="/"
                aria-label="Logixia home"
                className="inline-flex items-center gap-3 text-xl font-bold tracking-tight text-slate-100"
              >
                <img
                  src="/logixialogo.webp"
                  alt=""
                  className="size-11 object-contain"
                />
                Logixia<span className="-ml-3 text-cyan-500">.</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                Learn to code. Build something real.
                <br />
                One practical step at a time.
              </p>
            </div>
            <nav
              aria-label="Explore"
              className="flex flex-col items-start gap-3 text-sm"
            >
              <h2 className="mb-1 text-xs font-semibold tracking-wider text-slate-100">
                EXPLORE
              </h2>
              <Link to="/courses" className="text-slate-400 hover:text-white">
                Courses
              </Link>
              <Link to="/cohorts" className="text-slate-400 hover:text-white">
                Live cohorts
              </Link>
              <Link
                to="/playground"
                state={{ fromPublic: true }}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
              >
                Free playground <ArrowUpRight size={14} />
              </Link>
            </nav>
            <nav
              aria-label="Legal"
              className="flex flex-col items-start gap-3 text-sm"
            >
              <h2 className="mb-1 text-xs font-semibold tracking-wider text-slate-100">
                LEGAL
              </h2>
              <Link to="/privacy" className="text-slate-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-white">
                Terms of Use
              </Link>
              <a
                href="mailto:support@logixia.com.ng"
                className="text-slate-400 hover:text-white"
              >
                Contact support
              </a>
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-400">
            <span>
              © {new Date().getFullYear()} Logixia. All rights reserved.
            </span>
            <span>Learn. Practise. Build.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
