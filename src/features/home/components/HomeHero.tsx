import { ArrowRight, BookOpen, CheckCircle2, Circle, Flame, Play, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeLinks } from "../config";
import { CodeTokens, WindowFrame, buttonStyles, type CodeLineTokens } from "../shared";

const code: CodeLineTokens[] = [
  [["kw", "def "], ["fn", "greet"], ["txt", "("], ["var", "name"], ["txt", "):"]],
  [["com", '    """Return a friendly greeting."""']],
  [["kw", "    return "], ["str", 'f"Hello, '], ["txt", "{name}"], ["str", '!"']],
  [],
  [["fn", "print"], ["txt", "("], ["fn", "greet"], ["txt", "("], ["str", '"Ada"'], ["txt", "))"]],
];

const tests = [
  'greet("Ada") returns "Hello, Ada!"',
  'greet("Tunde") returns "Hello, Tunde!"',
  "prints the greeting once",
];

/** Steps: 0..code.length reveal lines, then run, then tests, then hold. */
const TOTAL_STEPS = code.length + 2 + tests.length + 4;

function useLoop() {
  const [step, setStep] = useState(code.length + 2 + tests.length);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % TOTAL_STEPS), 650);
    return () => window.clearInterval(id);
  }, []);
  return step;
}

export function HomeHero() {
  const step = useLoop();
  const visibleLines = Math.min(step, code.length);
  const ran = step > code.length;
  const passed = Math.max(0, Math.min(tests.length, step - code.length - 1));

  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="home-glow pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="home-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pb-28 lg:pt-20">
        <div className="public-page-enter min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-body">
            <span className="size-1.5 rounded-full bg-success" />
            Learn · Code · Practice · Assess · Grow
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            Learn to code.
            <br />
            Practice with purpose.
            <br />
            <span className="home-text-gradient">Build real skills.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
            Structured courses, hands-on coding tasks, daily challenges, quizzes and live
            cohort classrooms. Everything you need to grow from beginner to confident
            developer, in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={homeLinks.playground} state={{ fromPublic: true }} className={buttonStyles.primary}>
              <Play size={16} aria-hidden="true" />
              Try the playground
            </Link>
            <Link to={homeLinks.getStarted} state={{ fromPublic: true }} className={buttonStyles.secondary}>
              Start learning
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Write and run code right away in the playground.
          </p>
        </div>

        <div className="relative min-w-0">
          <WindowFrame
            title="Python Foundations › Functions › Lesson 3"
            right={
              <span className="hidden rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent sm:inline">
                Task 2 of 4
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-line p-5 md:border-b-0 md:border-r">
                <p className="flex items-center gap-2 text-xs font-medium text-muted">
                  <BookOpen size={14} aria-hidden="true" /> Lesson
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">Writing functions</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  A function packages logic so you can reuse it. Use{" "}
                  <code className="rounded bg-input px-1 font-mono text-[13px] text-foreground">
                    return
                  </code>{" "}
                  to send a value back.
                </p>
                <div className="mt-4 rounded-lg border border-line bg-input p-3">
                  <p className="text-xs font-semibold text-foreground">Your task</p>
                  <p className="mt-1 text-xs leading-relaxed text-body">
                    Write <span className="font-mono">greet(name)</span> so it returns a
                    greeting for any name.
                  </p>
                </div>
                <ul className="mt-4 space-y-2" aria-label="Task tests">
                  {tests.map((t, i) => {
                    const ok = i < passed;
                    return (
                      <li key={t} className="flex items-start gap-2 text-xs">
                        {ok ? (
                          <CheckCircle2 size={14} className="mt-px shrink-0 text-success" />
                        ) : (
                          <Circle size={14} className="mt-px shrink-0 text-muted" />
                        )}
                        <span className={ok ? "text-foreground" : "text-muted"}>{t}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex min-h-[340px] min-w-0 flex-col bg-input">
                <div className="flex items-center gap-1 border-b border-line px-3 text-xs">
                  <span className="border-b-2 border-accent px-2 py-2 font-mono text-foreground">
                    main.py
                  </span>
                  <span className="px-2 py-2 font-mono text-muted">test_main.py</span>
                </div>
                <pre className="flex-1 overflow-x-auto px-0 py-3 font-mono text-[13px] leading-6">
                  {code.map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-10 shrink-0 select-none pr-3 text-right text-muted/60">
                        {i + 1}
                      </span>
                      <span className={i < visibleLines ? "home-line-in" : "opacity-0"}>
                        <CodeTokens line={line} />
                        {i === Math.max(0, visibleLines - 1) && !ran && (
                          <span className="home-caret ml-0.5" />
                        )}
                        {line.length === 0 && "\u00a0"}
                      </span>
                    </div>
                  ))}
                </pre>
                <div className="border-t border-line bg-canvas/60 px-4 py-3 font-mono text-xs">
                  <p className="flex items-center gap-2 text-muted">
                    <Terminal size={13} aria-hidden="true" /> Terminal
                  </p>
                  <p className="mt-2 text-body">
                    <span className="text-success">$</span> python main.py
                  </p>
                  <p className={`mt-1 text-foreground ${ran ? "home-line-in" : "opacity-0"}`}>
                    Hello, Ada!
                  </p>
                  <p
                    className={`mt-1 ${passed === tests.length ? "text-success home-line-in" : "opacity-0"}`}
                  >
                    ✓ {tests.length}/{tests.length} tests passed
                  </p>
                </div>
              </div>
            </div>
          </WindowFrame>

          <div className="absolute -bottom-6 -right-3 hidden rounded-xl border border-line bg-surface px-4 py-3 shadow-xl sm:block">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Daily streak
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold text-foreground">
              12 days <Flame size={18} className="text-warning" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
