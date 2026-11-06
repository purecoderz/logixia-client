// components/Assignments/AssignmentsTable.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Assignment, AssignmentStatus } from "../services/assignmentService";
import { daysUntil, formatTime, plural } from "../utils/assignments";


type SortKey = "title" | "due" | "xp";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;


const CHIP: Record<AssignmentStatus, string> = {
  active: "bg-[#1f6feb]/15 text-accent",
  done: "bg-[#3fb950]/15 text-success",
  incomplete: "bg-[#d29922]/15 text-warning",
  missed: "bg-[#f85149]/15 text-danger",
};

function statusLabel(a: Assignment) {
  switch (a.uiStatus) {
    case "done":
      return "Completed";
    case "incomplete":
      return "Incomplete";
    case "missed":
      return "Missed";
    default:
      return a.status === null ? "Not started" : "In progress";
  }
}

function due(a: Assignment) {
  const d = new Date(a.due_date);
  const days = daysUntil(d);
  const ago = Math.abs(days);

  switch (a.uiStatus) {
    case "done":
      return { text: "Passed all tests", color: "text-success" };
    case "incomplete":
      return {
        text: ago === 0 ? "Deadline passed today" : `Deadline passed ${plural(ago)} ago`,
        color: "text-warning",
      };
    case "missed":
      return {
        text: ago === 0 ? "Overdue today" : `${plural(ago)} overdue`,
        color: "text-danger",
      };
    default:
      if (days === 0) return { text: `Today, ${formatTime(d)}`, color: "text-warning" };
      if (days === 1) return { text: `Tomorrow, ${formatTime(d)}`, color: "text-warning" };
      return { text: `In ${days} days`, color: "text-body" };
  }
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
        className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${active ? "text-foreground" : ""
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
    <div className="overflow-x-auto rounded-lg border border-line bg-input">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead className="bg-surface text-xs text-muted">
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
                className="border-t border-line transition-colors hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/assignments/${a.id}`}
                    className="font-medium text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {a.title}
                  </Link>
                  <div className="text-xs capitalize text-muted">{a.type}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${CHIP[a.uiStatus]}`}
                  >
                    {statusLabel(a)}
                  </span>
                </td>
                <td className={`px-4 py-3 ${d.color}`}>{d.text}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">{a.xp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}