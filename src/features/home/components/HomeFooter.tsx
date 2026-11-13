import { homeLinks, homeSections } from "../config";
import { Logo } from "../shared";
import { Link } from "react-router-dom";

export function HomeFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Learn the concepts. Write the code. Solve the problems. Keep growing.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div>
            <p className="font-semibold text-foreground">Explore</p>
            <ul className="mt-3 space-y-2">
              {homeSections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted hover:text-foreground">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">Get started</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to={homeLinks.playground} state={{ fromPublic: true }} className="text-muted hover:text-foreground">
                  Playground
                </Link>
              </li>
              <li>
                <Link to={homeLinks.getStarted} state={{ fromPublic: true }} className="text-muted hover:text-foreground">
                  Create account
                </Link>
              </li>
              <li>
                <Link to={homeLinks.signIn} state={{ fromPublic: true }} className="text-muted hover:text-foreground">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted sm:px-8">
          © {new Date().getFullYear()} Logixia Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
