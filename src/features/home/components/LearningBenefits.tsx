import { Code2, MessageCircle, Layers3 } from "lucide-react";

export function LearningBenefits() {
  return (
    <section
      aria-label="How you learn"
      className="grid gap-8 border-t border-line py-10 md:grid-cols-3 md:gap-6 lg:py-12"
    >
      {[
        {
          icon: Code2,
          title: "Learn by doing",
          text: "Write and run real code in your browser, with hands-on exercises.",
        },
        {
          icon: MessageCircle,
          title: "Get useful feedback",
          text: "See your output instantly and check your work with practical tests.",
        },
        {
          icon: Layers3,
          title: "Build real projects",
          text: "Put each lesson into practice, one useful project at a time.",
        },
      ].map(({ icon: Icon, title, text }, index) => (
        <div
          key={title}
          className={`flex gap-4 ${index ? "md:border-l md:border-line md:pl-6" : ""}`}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-[var(--home-highlight,#06b6d4)]">
            <Icon size={23} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
