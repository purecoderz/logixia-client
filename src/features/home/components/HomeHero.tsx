import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { WorkspacePreview } from "./WorkspacePreview";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function HomeHero() {
  return (
    <section className="grid items-center gap-12 pb-14 sm:pb-20 lg:grid-cols-[1fr_1.12fr] lg:gap-10 lg:pb-24">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent">
          LEARN. PRACTISE. BUILD.
        </p>
        <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl xl:text-[3.6rem]">
          Your first line of code.
          <br />
          Your{" "}
          <span className="text-[var(--home-highlight,#06b6d4)]">
            next big step.
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-body sm:text-lg sm:leading-8">
          Learn with an instructor or at your own pace. Write real code in your
          browser, from day one.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            to="/playground"
            state={{ fromPublic: true }}
            className={primaryButton}
          >
            Try the playground <ArrowRight size={16} />
          </Link>
          <Link
            to="/cohorts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:underline underline-offset-4"
          >
            Explore live cohorts <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            Beginner friendly
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            No signup needed to try
          </span>
        </div>
      </div>
      <WorkspacePreview />
    </section>
  );
}
