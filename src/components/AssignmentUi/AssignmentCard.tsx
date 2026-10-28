import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { Assignment } from "../../services/assignmentService";

const DAY = 86_400_000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const time = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function look(a: Assignment) {
  const due = new Date(a.due_date);
  const days = Math.round((startOfDay(due) - startOfDay(new Date())) / DAY);

  if (a.status === "done") {
    const when = a.submitted_at
      ? new Date(a.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : null;
    return {
      Icon: CheckCircle2,
      text: when ? `Submitted ${when}` : "Submitted",
      color: "text-[#3fb950]",
      bar: "bg-[#3fb950]",
      pill: "bg-[#3fb950]/15 text-[#3fb950]",
      xp: `${a.xp} XP earned`,
      progress: 1,
    };
  }

  if (a.status === "missed") {
    const n = Math.abs(days);
    return {
      Icon: AlertCircle,
      text: n === 0 ? "Overdue today" : `${n} day${n > 1 ? "s" : ""} overdue`,
      color: "text-[#f85149]",
      bar: "bg-[#f85149]",
      pill: "bg-[#f85149]/15 text-[#f85149]",
      xp: `${a.xp} XP`,
      progress: 1,
    };
  }

  const start = new Date(a.start_date).getTime();
  const end = due.getTime();
  const progress = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const soon = days <= 1;

  return {
    Icon: Clock,
    text:
      days === 0 ? `Today, ${time(due)}`
      : days === 1 ? `Tomorrow, ${time(due)}`
      : `In ${days} days`,
    color: soon ? "text-[#d29922]" : "text-[#c9d1d9]",
    bar: soon ? "bg-[#d29922]" : "bg-[#58a6ff]",
    pill: "bg-[#d29922]/15 text-[#d29922]",
    xp: `${a.xp} XP`,
    progress,
  };
}

export function AssignmentCard({ a }: { a: Assignment }) {
  const { Icon, text, color, bar, pill, xp, progress } = look(a);

  return (
    <Link
      to={`/assignments/${a.id}`}
      className="group flex min-h-[190px] flex-col rounded-xl border border-[#30363d] bg-[#0d1117] p-5 transition-colors hover:border-[#2fc47e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs text-[#8b949e]">{a.lesson_title}</span>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${pill}`}>
          {xp}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-white">
        {a.title}
      </h3>

      <div className="mt-auto pt-5">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[#21262d]"
          role="progressbar"
          aria-label="Time until deadline"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-[13px] font-medium ${color}`}>
            <Icon className="size-4" aria-hidden />
            {text}
          </span>
          <span className="flex size-8 items-center justify-center rounded-full border border-[#30363d] text-[#8b949e] transition-colors group-hover:border-[#8b949e] group-hover:text-white">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}