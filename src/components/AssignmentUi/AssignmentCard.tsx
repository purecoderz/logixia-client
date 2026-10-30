// components/Assignments/AssignmentCard.tsx
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Hourglass,
  Zap,
} from "lucide-react";
import type { Assignment } from "../../services/assignmentService";
import { daysUntil, formatTime, plural} from "../../utils/assignments";


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
        pill: "bg-[#3fb950]/15 text-[#3fb950]",
        text: "text-[#3fb950]",
        cta: "View",
      };

    case "incomplete":
      return {
        Icon: Hourglass,
        label: "Incomplete",
        detail: ago === 0 ? "Deadline passed today" : `Deadline passed ${plural(ago)} ago`,
        accent: "bg-[#d29922]",
        pill: "bg-[#d29922]/15 text-[#d29922]",
        text: "text-[#d29922]",
        cta: "View",
      };

    case "missed":
      return {
        Icon: AlertCircle,
        label: "Missed",
        detail: ago === 0 ? "Overdue today" : `${plural(ago)} overdue`,
        accent: "bg-[#f85149]",
        pill: "bg-[#f85149]/15 text-[#f85149]",
        text: "text-[#f85149]",
        cta: "View",
      };

    default: {
      const soon = days <= 1;
      const started = a.status === "in_progress" || a.status === "submitted";
      return {
        Icon: Clock,
        label: started ? "In progress" : "Not started",
        detail:
          days === 0 ? `Due today, ${formatTime(due)}`
          : days === 1 ? `Due tomorrow, ${formatTime(due)}`
          : `Due in ${days} days`,
        accent: soon ? "bg-[#d29922]" : "bg-[#58a6ff]",
        pill: started ? "bg-[#58a6ff]/15 text-[#58a6ff]" : "bg-[#21262d] text-[#8b949e]",
        text: soon ? "text-[#d29922]" : "text-[#c9d1d9]",
        cta: a.status === "in_progress" ? "Continue" : a.status === "submitted" ? "Retry" : "Start",
      };
    }
  }
}

export function AssignmentCard({ a }: { a: Assignment }) {
  const { Icon, label, detail, accent, pill, text, cta } = look(a);

  return (
    <Link
      to={`/assignments/${a.id}`}
      className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] p-5 transition-all hover:-translate-y-0.5 hover:border-[#8b949e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
    >
      {/* status accent along the top edge */}
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${accent}`} />

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-md bg-[#161b22] px-2 py-1 text-[11px] font-medium capitalize text-[#8b949e]">
          <Code2 className="size-3.5" aria-hidden />
          {a.type}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill}`}>
          {label}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-white">
        {a.title}
      </h3>

      <p className={`mt-2 flex items-center gap-1.5 text-[13px] font-medium ${text}`}>
        <Icon className="size-4 shrink-0" aria-hidden />
        {detail}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-[#21262d] pt-4">
        <span className="flex items-center gap-1 text-sm font-semibold text-[#c9d1d9]">
          <Zap className="size-4 text-[#d29922]" aria-hidden />
          {a.xp} XP
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-[#8b949e] transition-colors group-hover:text-white">
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