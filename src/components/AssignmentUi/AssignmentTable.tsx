// components/Assignments/AssignmentsTable.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Assignment, AssignmentStatus } from "../../services/assignmentService";

type SortKey = "title" | "due" | "xp";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;

const DAY = 86_400_000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const time = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const STATUS: Record<AssignmentStatus, { label: string; chip: string }> = {
  active: { label: "Active", chip: "bg-[#1f6feb]/15 text-[#58a6ff]" },
  done: { label: "Done", chip: "bg-[#3fb950]/15 text-[#3fb950]" },
  missed: { label: "Missed", chip: "bg-[#f85149]/15 text-[#f85149]" },
};

function due(a: Assignment) {
  const d = new Date(a.due_date);
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY);

  if (a.status === "done") {
    const when = a.submitted_at
      ? new Date(a.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : null;
    return { text: when ? `Submitted ${when}` : "Submitted", color: "text-[#3fb950]" };
  }
  if (a.status === "missed") {
    const n = Math.abs(days);
    return {
      text: n === 0 ? "Overdue today" : `${n} day${n > 1 ? "s" : ""} overdue`,
      color: "text-[#f85149]",
    };
  }
  if (days === 0) return { text: `Today, ${time(d)}`, color: "text-[#d29922]" };
  if (days === 1) return { text: `Tomorrow, ${time(d)}`, color: "text-[#d29922]" };
  return { text: `In ${days} days`, color: "text-[#c9d1d9]" };
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sort: Sort;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort?.key === k;
  const Arrow = sort?.dir === "desc" ? ArrowDown : ArrowUp;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-2.5 font-medium ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-white ${
          active ? "text-white" : ""
        }`}
      >
        {label}
        {active && <Arrow className="size-3" aria-hidden />}
      </button>
    </th>
  );
}

export function AssignmentsTable({ assignments }: { assignments: Assignment[] }) {
  const [sort, setSort] = useState<Sort>(null);

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s?.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
        ? { key, dir: "desc" }
        : null // third click returns to the default order
    );

  const rows = useMemo(() => {
    if (!sort) return assignments;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...assignments].sort((x, y) => {
      if (sort.key === "title") return x.title.localeCompare(y.title) * dir;
      if (sort.key === "xp") return (x.xp - y.xp) * dir;
      return (new Date(x.due_date).getTime() - new Date(y.due_date).getTime()) * dir;
    });
  }, [assignments, sort]);

  return (
    <div className="overflow-x-auto rounded-lg border border-[#30363d] bg-[#0d1117]">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead className="bg-[#161b22] text-xs text-[#8b949e]">
          <tr>
            <SortHeader label="Assignment" k="title" sort={sort} onSort={onSort} />
            <th scope="col" className="px-4 py-2.5 text-left font-medium">Status</th>
            <SortHeader label="Due" k="due" sort={sort} onSort={onSort} />
            <SortHeader label="XP" k="xp" sort={sort} onSort={onSort} align="right" />
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const d = due(a);
            return (
              <tr
                key={a.id}
                className="border-t border-[#21262d] transition-colors hover:bg-[#161b22]"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/assignments/${a.id}`}
                    className="font-medium text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
                  >
                    {a.title}
                  </Link>
                  <div className="text-xs text-[#8b949e]">{a.lesson_title}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${STATUS[a.status].chip}`}
                  >
                    {STATUS[a.status].label}
                  </span>
                </td>
                <td className={`px-4 py-3 ${d.color}`}>{d.text}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-[#8b949e]">{a.xp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}