import { CalendarCheck, Check, Clock, Flame, Play, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { homeLinks } from "../config";
import { Reveal, SectionHeading, buttonStyles } from "../shared";

const week = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: true },
  { day: "S", done: false, today: true },
  { day: "S", done: false },
];

const options = ["4", "5", "6", "Error"];
const correct = "5";

export function HomePractice() {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <section id="practice" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Practice & assessment"
        title="Small challenges. Consistent practice. Real progress."
        description="Coding is a skill that grows through repetition. Daily tasks keep you writing code, and quizzes show you what has really stuck."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily task */}
        <Reveal>
          <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarCheck size={17} className="text-accent" /> Daily task
              </p>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                <Flame size={13} /> 12-day streak
              </p>
            </div>

            <ol className="mt-6 grid grid-cols-7 gap-2" aria-label="This week">
              {week.map((d, i) => (
                <li key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`grid size-9 place-items-center rounded-lg border text-xs ${
                      d.done
                        ? "border-success/40 bg-success/15 text-success"
                        : d.today
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-line text-muted"
                    }`}
                  >
                    {d.done ? <Check size={15} /> : d.today ? "●" : ""}
                  </span>
                  <span className="text-[11px] text-muted">{d.day}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex-1 rounded-xl border border-line bg-input p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded bg-success/15 px-2 py-0.5 font-semibold text-success">Easy</span>
                <span className="rounded bg-surface-muted px-2 py-0.5 text-body">Strings</span>
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock size={12} /> ~10 min
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground">Is it a palindrome?</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-body">
                Write <span className="font-mono text-foreground">is_palindrome(word)</span> that
                returns <span className="font-mono">True</span> when a word reads the same
                backwards. Ignore upper and lower case.
              </p>
              <pre className="mt-4 rounded-lg border border-line bg-canvas/60 p-3 font-mono text-[12.5px] leading-6">
                <span className="hl-fn">is_palindrome</span>
                <span className="hl-txt">(</span>
                <span className="hl-str">"Level"</span>
                <span className="hl-txt">)</span>
                <span className="hl-com">  # True</span>
              </pre>
            </div>

            <Link to={homeLinks.playground} state={{ fromPublic: true }} className={`${buttonStyles.secondary} mt-6 self-start`}>
              <Play size={15} /> Try a challenge in the playground
            </Link>
          </article>
        </Reveal>

        {/* Quiz */}
        <Reveal delay={120}>
          <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Module quiz · Strings</p>
              <p className="font-mono text-xs text-muted">Question 3 / 10</p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full w-[30%] rounded-full bg-accent" />
            </div>

            <h3 className="mt-6 text-lg font-semibold text-foreground">What does this code print?</h3>
            <pre className="mt-3 rounded-lg border border-line bg-input p-4 font-mono text-[13px]">
              <span className="hl-fn">print</span>
              <span className="hl-txt">(</span>
              <span className="hl-fn">len</span>
              <span className="hl-txt">(</span>
              <span className="hl-str">"logic"</span>
              <span className="hl-txt">))</span>
            </pre>

            <div className="mt-5 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Answers">
              {options.map((o, i) => {
                const picked = answer === o;
                const show = answer !== null;
                const isRight = o === correct;
                const tone = !show
                  ? "border-line hover:border-accent hover:bg-hover"
                  : isRight
                    ? "border-success bg-success/10"
                    : picked
                      ? "border-danger bg-danger/10"
                      : "border-line opacity-60";
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    disabled={show}
                    onClick={() => setAnswer(o)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${tone}`}
                  >
                    <span className="grid size-6 place-items-center rounded-md bg-surface-muted font-mono text-xs text-muted">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-mono text-sm text-foreground">{o}</span>
                    {show && isRight && <Check size={16} className="text-success" />}
                    {show && picked && !isRight && <X size={16} className="text-danger" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 min-h-[72px] flex-1">
              {answer === null ? (
                <p className="text-sm text-muted">Pick an answer to check your understanding.</p>
              ) : (
                <div className="home-line-in rounded-lg border border-line bg-input p-4 text-sm">
                  <p className={answer === correct ? "font-semibold text-success" : "font-semibold text-danger"}>
                    {answer === correct ? "Correct!" : "Not quite."}
                  </p>
                  <p className="mt-1 text-body">
                    <span className="font-mono">len()</span> counts characters, and "logic" has 5.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAnswer(null)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    <RotateCcw size={12} /> Try again
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 font-mono text-xs text-muted">
              Test your knowledge. Understand your progress. Improve your skills.
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
