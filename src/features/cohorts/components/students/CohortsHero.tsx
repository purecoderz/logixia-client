import { Users, type LucideIcon } from "lucide-react";

interface HeroFact {
  icon: LucideIcon;
  label: string;
}

interface CohortsHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  facts: HeroFact[];
}

export function GlobalHero({
  eyebrow,
  title,
  description,
  facts,
}: CohortsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-accent/25 bg-accent/[0.08] p-6">
      <Users
        size={96}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-accent/15"
        aria-hidden
      />

      <p className="text-xs text-accent">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-medium text-foreground">{title}</h1>
      <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        {facts.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon size={16} className="text-muted" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
