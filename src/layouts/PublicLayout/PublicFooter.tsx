import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/features/home/shared";
import "./public-footer.css";

export function PublicFooter() {
  return (
    <footer className="public-footer mt-8 select-none">
      {/* Multi-layered smooth architectural wave */}
      <div className="relative overflow-hidden leading-none">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          className="-mb-px block h-14 w-full sm:h-20 lg:h-24"
        >
          {/* Back ambient wave */}
          <path
            d="M0,48 C320,108 640,-8 960,44 C1200,82 1340,64 1440,36 L1440,110 L0,110 Z"
            fill="var(--footer-wave-back)"
          />
          {/* Mid depth wave */}
          <path
            d="M0,68 C280,18 600,96 940,52 C1180,22 1330,48 1440,66 L1440,110 L0,110 Z"
            fill="var(--footer-wave-mid)"
          />
          {/* Foreground primary wave */}
          <path
            d="M0,56 C360,104 720,16 1080,62 C1260,84 1368,74 1440,52 L1440,110 L0,110 Z"
            fill="var(--footer-background)"
          />
          {/* Subtle top crest highlight */}
          <path
            d="M0,56 C360,104 720,16 1080,62 C1260,84 1368,74 1440,52"
            fill="none"
            stroke="var(--footer-wave-stroke)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="bg-[var(--footer-background)] text-body">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 py-10 sm:grid-cols-[1fr_auto_auto] sm:gap-14 sm:py-12">
            <div>
              <Link
                to="/"
                aria-label="Logixia Academy home"
                className="inline-flex items-center text-foreground"
              >
                <Logo />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                Learn the concepts. Write the code. Solve the problems. Keep
                growing — one practical step at a time.
              </p>
            </div>

            <nav
              aria-label="Explore"
              className="flex flex-col items-start gap-2.5 text-sm"
            >
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">
                Explore
              </h2>
              <Link
                to="/#how-it-works"
                className="text-muted transition-colors hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                to="/#classroom"
                className="text-muted transition-colors hover:text-foreground"
              >
                Live classroom
              </Link>
              <Link
                to="/#practice"
                className="text-muted transition-colors hover:text-foreground"
              >
                Practice
              </Link>
              <Link
                to="/#learning"
                className="text-muted transition-colors hover:text-foreground"
              >
                Ways to learn
              </Link>
              <Link
                to="/playground"
                state={{ fromPublic: true }}
                className="inline-flex items-center gap-1 text-muted transition-colors hover:text-foreground"
              >
                Free playground <ArrowUpRight size={14} />
              </Link>
            </nav>

            <nav
              aria-label="Legal"
              className="flex flex-col items-start gap-2.5 text-sm"
            >
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">
                Legal & Support
              </h2>
              <Link
                to="/privacy"
                className="text-muted transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted transition-colors hover:text-foreground"
              >
                Terms of Use
              </Link>
              <a
                href="mailto:support@logixia.com.ng"
                className="text-muted transition-colors hover:text-foreground"
              >
                Contact support
              </a>
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-xs text-muted">
            <span>
              © {new Date().getFullYear()} Logixia Academy. All rights reserved.
            </span>
            <span>Learn. Practise. Build.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
