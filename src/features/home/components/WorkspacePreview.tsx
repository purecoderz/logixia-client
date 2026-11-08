import { Check, Code2 } from "lucide-react";

export function WorkspacePreview() {
  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-full home-glow bg-cyan-500/10 blur-3xl"
      />
      <div className="home-preview relative overflow-hidden rounded-xl border border-line-strong bg-surface shadow-xl shadow-black/10">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Code2 className="text-[var(--home-highlight,#06b6d4)]" size={20} />
            Python fundamentals
          </span>
          <span className="shrink-0 rounded-full bg-hover px-2.5 py-1 text-[10px] text-muted">
            Lesson 03
          </span>
        </div>
        <div className="grid sm:grid-cols-[170px_1fr] lg:grid-cols-[150px_1fr] xl:grid-cols-[190px_1fr]">
          <div className="border-b border-line p-4 sm:border-r sm:border-b-0">
            <h2 className="text-sm font-semibold text-foreground">
              Make it personal
            </h2>
            <p className="mt-3 text-xs leading-6 text-body">
              Create a variable called <code className="text-accent">name</code>{" "}
              and give it your name. Then print a friendly greeting.
            </p>
            <ol className="mt-5 hidden space-y-4 border-t border-line pt-4 text-xs text-body sm:block">
              {[
                "Create a variable called name.",
                "Print a greeting using that variable.",
              ].map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-success">
                    {index + 1}
                  </span>
                  <span className="leading-5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="min-w-0">
            <div className="border-b border-line px-4">
              <span className="inline-block border-b-2 border-cyan-500 py-3 font-mono text-xs text-body">
                main.py
              </span>
            </div>
            <div
              className="overflow-x-auto px-4 py-7 font-mono text-xs leading-7 sm:min-h-40"
              aria-label="Example Python code"
            >
              <div className="whitespace-pre">
                <span className="mr-4 select-none text-muted">1</span>
                <span className="text-foreground">name = </span>
                <span className="text-warning">&quot;Ada&quot;</span>
              </div>
              <div className="whitespace-pre">
                <span className="mr-4 select-none text-muted">2</span>
                <span className="text-accent">print</span>
                <span className="text-foreground">(</span>
                <span className="text-warning">f&quot;Hello, </span>
                <span className="text-foreground">{"{name}"}</span>
                <span className="text-warning">!&quot;</span>
                <span className="text-foreground">)</span>
              </div>
            </div>
            <div className="border-t border-line bg-input">
              <div className="flex gap-5 border-b border-line px-4 text-xs">
                <span className="border-b-2 border-cyan-500 py-2 text-foreground">
                  Output
                </span>
                <span className="py-2 text-muted">Tests</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5">
                <span className="font-mono text-xs text-foreground">
                  Hello, Ada!
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-success">
                  <Check size={12} />
                  Tests passed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-right text-[11px] text-muted">
        A preview of learning on Logixia
      </p>
    </div>
  );
}
