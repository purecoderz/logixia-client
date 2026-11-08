import { Link } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";
import { homeTextLink as textLink } from "./homeStyles";

export function PlaygroundInvitation() {
  return (
    <section className="home-invitation mt-4 flex flex-col gap-6 rounded-xl border border-line-strong bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-4">
        <Terminal
          size={33}
          className="shrink-0 text-[var(--home-highlight,#06b6d4)]"
        />
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Just curious? Start with the free playground.
          </h2>
          <p className="mt-2 text-sm text-muted">
            No account. No installation. Just you and your code.
          </p>
        </div>
      </div>
      <Link
        to="/playground"
        state={{ fromPublic: true }}
        className={`${textLink} shrink-0`}
      >
        Open playground <ArrowRight size={16} />
      </Link>
    </section>
  );
}
