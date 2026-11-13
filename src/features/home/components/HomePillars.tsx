import { BookOpen, Code2, Repeat, ListChecks, TrendingUp } from "lucide-react";
import { Reveal } from "../shared";

const pillars = [
  { icon: BookOpen, name: "Learn", text: "Clear, structured lessons that build on each other." },
  { icon: Code2, name: "Code", text: "Write real code with starter files and automatic checks." },
  { icon: Repeat, name: "Practice", text: "Short daily tasks that turn knowledge into habit." },
  { icon: ListChecks, name: "Assess", text: "Quizzes that show what you know and what to revisit." },
  { icon: TrendingUp, name: "Grow", text: "See your progress add up, task by task." },
];

export function HomePillars() {
  return (
    <section aria-label="How Logixia works" className="border-y border-line bg-surface/50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-2 sm:divide-y-0 sm:px-8 lg:grid-cols-5 lg:divide-x">
        {pillars.map((p, i) => (
          <Reveal key={p.name} delay={i * 70} className="px-1 py-7 sm:px-6 lg:first:pl-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
              <p.icon size={18} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-body">{p.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
