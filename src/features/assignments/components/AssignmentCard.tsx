// components/Assignments/AssignmentCard.tsx
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  HelpCircle,
  Hourglass,
  Zap,
} from "lucide-react";
import type { Assignment } from "../services/assignmentService";
import { daysUntil, formatTime, plural } from "../utils/assignments";

function look(a: Assignment) {
  const due = new Date(a.due_date);
  const days = daysUntil(due);
  const ago = Math.abs(days);

  switch (a.uiStatus) {
    case "done":
      return {
        Icon: CheckCircle2,
        label: "Completed",
        detail: "Passed all tests",
        accent: "bg-[#3fb950]",
        pill: "bg-[#3fb950]/15 text-success",
        text: "text-success",
        cta: "View",
      };

    case "incomplete":
      return {
        Icon: Hourglass,
        label: "Incomplete",
        detail:
          ago === 0
            ? "Deadline passed today"
            : `Deadline passed ${plural(ago)} ago`,
        accent: "bg-[#d29922]",
        pill: "bg-[#d29922]/15 text-warning",
        text: "text-warning",
        cta: "View",
      };

    case "missed":
      return {
        Icon: AlertCircle,
        label: "Missed",
        detail: ago === 0 ? "Overdue today" : `${plural(ago)} overdue`,
        accent: "bg-[#f85149]",
        pill: "bg-[#f85149]/15 text-danger",
        text: "text-danger",
        cta: "View",
      };

    default: {
      const soon = days <= 1;
      const started = a.status === "in_progress" || a.status === "submitted";
      return {
        Icon: Clock,
        label: started ? "In progress" : "Not started",
        detail:
          days === 0
            ? `Due today, ${formatTime(due)}`
            : days === 1
              ? `Due tomorrow, ${formatTime(due)}`
              : `Due in ${days} days`,
        accent: soon ? "bg-[#d29922]" : "bg-accent",
        pill: started ? "bg-accent/15 text-accent" : "bg-hover text-muted",
        text: soon ? "text-warning" : "text-body",
        cta:
          a.status === "in_progress"
            ? "Continue"
            : a.status === "submitted"
              ? "Retry"
              : "Start",
      };
    }
  }
}

export function AssignmentCard({ a }: { a: Assignment }) {
  const { Icon, label, detail, accent, pill, text, cta } = look(a);
  const isQuiz = a.type === "quiz";
  const taskUrl = isQuiz ? `/tasks/${a.id}/quiz` : `/tasks/${a.id}`;
  const TypeIcon = isQuiz ? HelpCircle : Code2;

  return (
    <Link
      to={taskUrl}
      className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-xl border border-line bg-input p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* status accent along the top edge */}
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${accent}`} />

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-[11px] font-medium capitalize text-muted">
          <TypeIcon className="size-3.5" aria-hidden />
          {a.type}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill}`}
        >
          {label}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
        {a.title}
      </h3>

      <p
        className={`mt-2 flex items-center gap-1.5 text-[13px] font-medium ${text}`}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {detail}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="flex items-center gap-1 text-sm font-semibold text-body">
          <Zap className="size-4 text-warning" aria-hidden />
          {a.xp} XP
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors group-hover:text-foreground">
          {cta}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
