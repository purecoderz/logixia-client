import type { ReactNode } from "react";

interface SystemStatePageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  actions: ReactNode;
  fullScreen?: boolean;
}

/** Shared presentation for exceptional routes such as 404 and Coming Soon. */
export function SystemStatePage({
  eyebrow,
  title,
  description,
  icon,
  actions,
  fullScreen = false,
}: SystemStatePageProps) {
  return (
    <main
      className={`grid place-items-center bg-canvas px-4 text-body ${
        fullScreen ? "min-h-dvh py-12" : "min-h-[min(34rem,70vh)] py-8"
      }`}
    >
      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 text-center shadow-2xl shadow-black/10 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            {icon}
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        </div>
      </section>
    </main>
  );
}
