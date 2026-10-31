const bone = "rounded-md bg-gray-800 motion-safe:animate-pulse";

/** Gray outline of a list page (title, stat cards, tabs, table) shown while it loads. */
export function ListPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-6 p-6">
      <span className="sr-only">{label}…</span>

      <div className="space-y-2.5">
        <div className={`${bone} h-7 w-48`} />
        <div className={`${bone} h-3.5 w-80 max-w-full`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2.5 rounded-xl border border-gray-800 p-5">
            <div className={`${bone} h-3 w-24`} />
            <div className={`${bone} h-7 w-16`} />
            <div className={`${bone} h-3 w-32`} />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {[16, 20, 28, 24].map((w, i) => (
          <div key={i} className={`${bone} h-3.5`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>

      <div className="divide-y divide-gray-800 overflow-hidden rounded-xl border border-gray-800">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-5 items-center gap-4 px-4 py-5">
            <div className={`${bone} h-3.5 w-3/4`} />
            <div className={`${bone} h-3.5 w-2/5`} />
            <div className={`${bone} h-3.5 w-3/5`} />
            <div className={`${bone} h-3.5 w-1/2`} />
            <div className={`${bone} h-3.5 w-1/3`} />
          </div>
        ))}
      </div>
    </div>
  );
}