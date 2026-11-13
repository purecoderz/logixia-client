import { CheckCircle2, ChevronDown, ChevronRight, Circle, FileCode2, FlaskConical, PlayCircle } from "lucide-react";
import { Reveal, SectionHeading, WindowFrame } from "../shared";

const levels = [
  { name: "Course", text: "A complete subject, like Python or JavaScript, from first steps to real projects." },
  { name: "Module", text: "Focused topics such as control flow or functions, so nothing feels overwhelming." },
  { name: "Lesson", text: "Explanations, syntax and examples that build understanding step by step." },
  { name: "Task", text: "Hands-on problems with starter code and tests that check your solution." },
];

const modules = [
  { name: "Variables & data types", progress: 100 },
  { name: "Control flow", progress: 100 },
  { name: "Functions", progress: 60, open: true },
  { name: "Data structures", progress: 0 },
  { name: "Object-oriented programming", progress: 0 },
];

const lessons = [
  { name: "Defining a function", kind: "lesson", done: true },
  { name: "Parameters & arguments", kind: "lesson", done: true },
  { name: "Task: write greet(name)", kind: "task", done: false, current: true },
  { name: "Return values", kind: "lesson", done: false },
  { name: "Module quiz", kind: "quiz", done: false },
];

export function HomeLearningPath() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="A clear path"
            title="Know exactly where you are and what comes next."
            description="Every course is organised the same way, so you always move from understanding a concept to using it."
          />
          <ol className="relative mt-10 space-y-6 border-l border-line pl-8">
            {levels.map((l, i) => (
              <Reveal key={l.name} delay={i * 90}>
                <li className="relative">
                  <span className="absolute -left-[41px] grid size-[18px] place-items-center rounded-full border border-accent bg-canvas">
                    <span className="size-1.5 rounded-full bg-accent" />
                  </span>
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">
                    {l.name}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-body">{l.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={120}>
          <WindowFrame title="Course · Python Foundations">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Python Foundations</h3>
                  <p className="text-sm text-muted">5 modules · 38 lessons · 24 tasks</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">52%</p>
                  <p className="text-xs text-muted">complete</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-[52%] rounded-full bg-accent" />
              </div>

              <ul className="mt-6 space-y-2">
                {modules.map((m, i) => (
                  <li key={m.name} className="rounded-lg border border-line bg-input">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {m.open ? (
                        <ChevronDown size={16} className="text-muted" />
                      ) : (
                        <ChevronRight size={16} className="text-muted" />
                      )}
                      <span className="font-mono text-xs text-muted">M{i + 1}</span>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {m.name}
                      </span>
                      {m.progress === 100 ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : (
                        <span className="font-mono text-xs text-muted">{m.progress}%</span>
                      )}
                    </div>
                    {m.open && (
                      <ul className="border-t border-line px-4 py-2">
                        {lessons.map((l) => {
                          const Icon =
                            l.kind === "task" ? FileCode2 : l.kind === "quiz" ? FlaskConical : PlayCircle;
                          return (
                            <li
                              key={l.name}
                              className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
                                l.current ? "bg-accent/10" : ""
                              }`}
                            >
                              {l.done ? (
                                <CheckCircle2 size={15} className="text-success" />
                              ) : (
                                <Circle size={15} className="text-muted" />
                              )}
                              <Icon size={15} className={l.current ? "text-accent" : "text-muted"} />
                              <span className={l.current ? "font-medium text-foreground" : "text-body"}>
                                {l.name}
                              </span>
                              {l.current && (
                                <span className="ml-auto rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent">
                                  Continue
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </WindowFrame>
        </Reveal>
      </div>
    </section>
  );
}
