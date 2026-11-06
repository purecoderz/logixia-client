const bone = "rounded-md bg-surface-muted motion-safe:animate-pulse";

/** Outline-shaped placeholder, so the page doesn't jump when the data arrives. */
export function BuilderSkeleton() {
  return (
    <div role="status" aria-label="Loading the course outline" className="mx-auto max-w-6xl space-y-6 p-6">
      <span className="sr-only">Loading the course outline…</span>
      <div className="space-y-2.5">
        <div className={`${bone} h-3.5 w-40`} />
        <div className={`${bone} h-8 w-96 max-w-full`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-line p-5">
              <div className={`${bone} size-5`} />
              <div className={`${bone} h-4 w-56`} />
              <div className={`${bone} ml-auto h-3.5 w-24`} />
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-xl border border-line p-5">
          <div className={`${bone} h-3.5 w-48`} />
          <div className={`${bone} h-3.5 w-full`} />
          <div className={`${bone} h-3.5 w-5/6`} />
        </div>
      </div>
    </div>
  );
}