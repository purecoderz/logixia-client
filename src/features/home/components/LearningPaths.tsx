import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { homeTextLink as textLink } from "./homeStyles";

export function LearningPaths() {
  return (
    <section className="py-8 sm:py-12" aria-labelledby="learning-paths">
      <h2
        id="learning-paths"
        className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        Choose how you learn.
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="home-panel relative flex min-h-80 flex-col overflow-hidden rounded-xl border border-line-strong bg-surface p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-40 size-80 rounded-full bg-cyan-500/10"
          />
          <span className="w-fit rounded-md bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-success">
            LIVE WITH AN INSTRUCTOR
          </span>
          <h3 className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
            Live cohorts
          </h3>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-64 text-base leading-7">
              A small group. A clear schedule. Support along the way.
            </p>
            <div aria-hidden="true" className="flex -space-x-3">
              {[
                "bg-cyan-500/20 text-[var(--home-highlight,#06b6d4)] border-cyan-500/50",
                "bg-emerald-500/20 text-success border-emerald-500/50",
                "bg-violet-500/20 text-accent border-violet-500/50",
              ].map((color, index) => (
                <span
                  key={color}
                  className={`flex size-12 items-center justify-center rounded-full border text-xl sm:size-14 ${color}`}
                >
                  {["A", "B", "C"][index]}
                </span>
              ))}
            </div>
          </div>
          <Link to="/cohorts" className={`${textLink} relative mt-auto pt-8`}>
            Explore cohorts <ArrowRight size={16} />
          </Link>
        </article>
        <article className="home-panel relative flex min-h-80 flex-col overflow-hidden rounded-xl border border-line-strong bg-surface p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Self-paced courses
          </h3>
          <p className="mt-3 max-w-sm text-base leading-7">
            Learn on your schedule, one practical lesson at a time.
          </p>
          <div aria-hidden="true" className="mt-6 space-y-2">
            {[
              { title: "Learn the concepts", icon: "01" },
              { title: "Put them into practice", icon: "02" },
            ].map(({ title, icon }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-lg border border-line bg-input px-4 py-3"
              >
                <span className="font-mono text-xs text-accent">{icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {title}
                </span>
                <span className="ml-auto flex gap-1">
                  <span className="h-1.5 w-5 rounded bg-emerald-500/70" />
                  <span className="h-1.5 w-5 rounded bg-hover" />
                  <span className="hidden h-1.5 w-5 rounded bg-hover sm:block" />
                </span>
              </div>
            ))}
          </div>
          <Link to="/courses" className={`${textLink} mt-auto pt-7`}>
            Browse courses <ArrowRight size={16} />
          </Link>
        </article>
      </div>
    </section>
  );
}
