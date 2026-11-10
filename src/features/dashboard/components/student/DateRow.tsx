import type { Assignment } from "@/features/assignments/services/assignmentService";
import { formatTime } from "@/features/assignments/utils/assignments";
import { Link } from "react-router-dom";

const LATE = {
  missed: { label: "Missed", color: "text-danger" },
  incomplete: { label: "Incomplete", color: "text-warning" },
} as const;

export function DateRow({ a }: { a: Assignment }) {
  const d = new Date(a.due_date);
  const late =
    a.uiStatus === "missed" || a.uiStatus === "incomplete"
      ? LATE[a.uiStatus]
      : null;

  const taskUrl = a.type === "quiz" ? `/tasks/${a.id}/quiz` : `/tasks/${a.id}`;

  return (
    <Link
      to={taskUrl}
      className="flex items-center gap-3 rounded-xl bg-input p-3 transition-colors hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface leading-none">
        <span className="text-sm font-bold text-foreground">{d.getDate()}</span>
        <span className="mt-0.5 text-[10px] uppercase text-muted">
          {d.toLocaleDateString(undefined, { month: "short" })}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {a.title}
        </p>
        <p className={`mt-0.5 text-xs ${late?.color ?? "text-muted"}`}>
          {late?.label ?? formatTime(d)}
        </p>
      </div>
    </Link>
  );
}
