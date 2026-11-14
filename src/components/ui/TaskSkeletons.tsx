const bone = "rounded-md bg-surface-muted motion-safe:animate-pulse";

/** Split-pane skeleton matching the coding workspace (top bar, instructions, editor, terminal). */
export function WorkspaceSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-dvh flex-col bg-canvas text-body"
    >
      <span className="sr-only">{label}…</span>

      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line bg-surface px-3">
        <div className="flex items-center gap-3">
          <div className={`${bone} h-6 w-16`} />
          <div className={`${bone} h-4 w-40`} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`${bone} h-7 w-24`} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 p-2 md:grid-cols-[2fr_3fr]">
        <div className="flex flex-col overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex h-9 items-center justify-between border-b border-line px-3">
            <div className={`${bone} h-3.5 w-32`} />
            <div className={`${bone} h-6 w-20`} />
          </div>
          <div className="space-y-3 p-4">
            <div className={`${bone} h-5 w-3/5`} />
            <div className={`${bone} h-3.5 w-full`} />
            <div className={`${bone} h-3.5 w-11/12`} />
            <div className={`${bone} h-3.5 w-4/5`} />
            <div className={`${bone} mt-4 h-20 w-full rounded-lg`} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-[3] flex-col overflow-hidden rounded-md border border-line bg-surface">
            <div className="flex h-9 items-center gap-2 border-b border-line px-3">
              <div className={`${bone} h-5 w-20`} />
              <div className={`${bone} h-5 w-16`} />
            </div>
            <div className="space-y-2.5 p-4">
              <div className={`${bone} h-3.5 w-2/5`} />
              <div className={`${bone} h-3.5 w-3/5`} />
              <div className={`${bone} h-3.5 w-1/2`} />
              <div className={`${bone} h-3.5 w-2/3`} />
            </div>
          </div>

          <div className="flex flex-[2] flex-col overflow-hidden rounded-md border border-line bg-surface">
            <div className="flex h-8 items-center border-b border-line px-3">
              <div className={`${bone} h-3 w-20`} />
            </div>
            <div className="space-y-2 p-3">
              <div className={`${bone} h-3 w-1/3`} />
              <div className={`${bone} h-3 w-1/2`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Centered card skeleton matching the quiz layout (header + progress, question + 4 options, footer). */
export function QuizSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4"
    >
      <span className="sr-only">{label}…</span>

      <div className="flex items-center justify-between">
        <div className={`${bone} h-4 w-28`} />
        <div className={`${bone} h-7 w-20`} />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div className={`${bone} h-5 w-16 rounded-full`} />
        <div className={`${bone} h-6 w-2/3`} />
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between">
            <div className={`${bone} h-3 w-24`} />
            <div className={`${bone} h-3 w-20`} />
          </div>
          <div className={`${bone} h-1.5 w-full rounded-full`} />
        </div>
      </div>

      <div className="flex-1 space-y-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="space-y-2">
          <div className={`${bone} h-3 w-20`} />
          <div className={`${bone} h-5 w-4/5`} />
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 rounded-xl border border-line p-4"
            >
              <div className={`${bone} size-4 shrink-0 rounded-full`} />
              <div className={`${bone} h-4 w-3/5`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <div className={`${bone} h-9 w-24 rounded-lg`} />
        <div className={`${bone} h-9 w-24 rounded-lg`} />
      </div>
    </div>
  );
}
