import { Link } from "react-router-dom";
import type { Assignment } from "../../services/assignmentService";
import { formatTime } from "../../utils/assignments";


const LATE = {
  missed: { label: "Missed", color: "text-[#f85149]" },
  incomplete: { label: "Incomplete", color: "text-[#d29922]" },
} as const;

export function DateRow({ a }: { a: Assignment }) {
  const d = new Date(a.due_date);
  const late = a.uiStatus === "missed" || a.uiStatus === "incomplete" ? LATE[a.uiStatus] : null;

  return (
    <Link
      to={`/assignments/${a.id}`}
      className="flex items-center gap-3 rounded-xl bg-[#0d1117] p-3 transition-colors hover:bg-[#21262d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
    >
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#161b22] leading-none">
        <span className="text-sm font-bold text-white">{d.getDate()}</span>
        <span className="mt-0.5 text-[10px] uppercase text-[#8b949e]">
          {d.toLocaleDateString(undefined, { month: "short" })}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{a.title}</p>
        <p className={`mt-0.5 text-xs ${late?.color ?? "text-[#8b949e]"}`}>
          {late?.label ?? formatTime(d)}
        </p>
      </div>
    </Link>
  );
}