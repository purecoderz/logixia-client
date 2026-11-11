import { BookOpen, Code2, History, Radio } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { to: "/tasks", label: "Continue tasks", detail: "Practice and submit", Icon: BookOpen },
  { to: "/live-stream", label: "Live classes", detail: "View your schedule", Icon: Radio },
  { to: "/history", label: "Session history", detail: "Review recordings", Icon: History },
  { to: "/playground", label: "Open playground", detail: "Experiment with code", Icon: Code2 },
];

export function StudentQuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ to, label, detail, Icon }) => (
          <Link
            key={to}
            to={to}
            className="student-card group flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{label}</span>
              <span className="mt-0.5 block text-xs text-muted">{detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
