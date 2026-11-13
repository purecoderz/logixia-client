import { Check, Compass, Users } from "lucide-react";
import { Reveal, SectionHeading } from "../shared";

const modes = [
  {
    icon: Compass,
    tag: "Self-paced",
    title: "Learn on your own schedule",
    text: "Choose a course and work through modules, lessons, tasks and quizzes whenever it suits you.",
    points: ["Start any time", "Move at your own speed", "Practise every day with daily tasks"],
  },
  {
    icon: Users,
    tag: "Cohort",
    title: "Learn with a guided group",
    text: "Join a cohort that follows a shared curriculum, with assigned tasks, assessments and live coding sessions.",
    points: ["Instructor-led live classrooms", "Assigned tasks and quizzes", "Your own separate group space"],
  },
];

const audience = [
  "Complete beginners",
  "Aspiring software developers",
  "Self-taught programmers",
  "Students & tech enthusiasts",
  "Cohort-based learners",
];

export function HomeLearningModes() {
  return (
    <section id="learning" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeading
          eyebrow="Two ways to learn"
          title="Study on your own, or with a group."
          description="The same well-structured courses work both ways, so you can pick what fits your life."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {modes.map((m, i) => (
            <Reveal key={m.tag} delay={i * 100}>
              <article className="h-full rounded-2xl border border-line bg-surface p-7 sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-accent/10 text-accent">
                    <m.icon size={20} />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">{m.tag}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">{m.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{m.text}</p>
                <ul className="mt-6 space-y-2.5">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-body">
                      <Check size={16} className="text-success" /> {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <p className="text-sm font-medium text-muted">Built for</p>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {audience.map((a) => (
              <li
                key={a}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-body"
              >
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
