import { ArrowRight, Code2, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../theme/ThemeProvider";
import { HeroIllustration } from "./herosvg";

interface DashboardHeroProps {
  name: string;
  cohortName?: string;
  dueCount: number;
  todayCount?: number;
  onReview?: () => void;
}

export function DashboardHero({
  name,
  cohortName,
  dueCount,
  todayCount = 0,
  onReview,
}: DashboardHeroProps) {
  const { theme } = useTheme();
  return (
    <section className="student-dashboard-hero overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.08] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          {cohortName && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              <GraduationCap className="size-3.5" aria-hidden />
              <span className="truncate">{cohortName}</span>
            </div>
          )}
          <h1
            title={`Hello ${name}!`}
            className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Welcome back, {name}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-body">
            {dueCount > 0
              ? `You have ${dueCount} active ${dueCount === 1 ? "task" : "tasks"}${todayCount > 0 ? ` (${todayCount} due today)` : ""}. Pick up right where you left off.`
              : "You're all caught up on your cohort tasks. Great work keeping pace!"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onReview}
              className="student-review-button inline-flex items-center gap-1.5 rounded-lg bg-[#142844] px-4 py-2 text-xs font-semibold text-white transition-colors hover:cursor-pointer hover:bg-[#388bfd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:text-sm"
            >
              {dueCount > 0 ? "Review tasks" : "Browse tasks"}
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <Link
              to="/playground"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/80 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-hover sm:text-sm"
            >
              <Code2 className="size-4 text-accent" aria-hidden />
              Open Playground
            </Link>
          </div>
        </div>

        {theme === "light" ? (
          <img
            src="/dashhero-light.svg"
            alt=""
            aria-hidden="true"
            width={800}
            height={573}
            className="pointer-events-none hidden h-auto w-36 shrink-0 md:block lg:w-44"
          />
        ) : (
          <HeroIllustration
            aria-hidden
            role="presentation"
            className="pointer-events-none hidden h-auto w-36 shrink-0 md:block lg:w-44"
          />
        )}
      </div>
    </section>
  );
}
