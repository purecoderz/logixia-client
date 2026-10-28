// components/Assignments/AssignmentsView.tsx
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import type { Assignment, AssignmentStatus } from "../../services/assignmentService";
import { FilterTabs } from "../../components/Cohorts/FilterTabs";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentsTable } from "./AssignmentTable";


type Filter = "all" | AssignmentStatus;
type View = "grid" | "table";

const RANK: Record<AssignmentStatus, number> = { active: 0, missed: 1, done: 2 };
const VIEW_KEY = "assignments-view";

export function AssignmentsView({ assignments }: { assignments: Assignment[] }) {
  const [filter, setFilter] = useState<Filter>("active");
  const [view, setView] = useState<View>(() =>
    localStorage.getItem(VIEW_KEY) === "table" ? "table" : "grid"
  );

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  const options = useMemo(() => {
    const count = (s: AssignmentStatus) => assignments.filter((a) => a.status === s).length;
    return [
      { value: "all" as Filter, label: `All ${assignments.length}` },
      { value: "active" as Filter, label: `Active ${count("active")}` },
      { value: "done" as Filter, label: `Done ${count("done")}` },
      { value: "missed" as Filter, label: `Missed ${count("missed")}` },
    ];
  }, [assignments]);

  const visible = useMemo(
    () =>
      assignments
        .filter((a) => filter === "all" || a.status === filter)
        .sort(
          (x, y) =>
            RANK[x.status] - RANK[y.status] ||
            new Date(x.due_date).getTime() - new Date(y.due_date).getTime()
        ),
    [assignments, filter]
  );

  const toggle = (v: View) =>
    `flex items-center justify-center px-2.5 py-1.5 transition-colors ${
      view === v ? "bg-[#161b22] text-white" : "text-[#8b949e] hover:text-white"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <FilterTabs options={options} value={filter} onChange={setFilter} />

        <div
          className="flex shrink-0 divide-x divide-[#30363d] overflow-hidden rounded-md border border-[#30363d]"
          role="group"
          aria-label="View"
        >
          <button
            type="button"
            className={toggle("grid")}
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className={toggle("table")}
            onClick={() => setView("table")}
            aria-label="Table view"
            aria-pressed={view === "table"}
          >
            <List className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {!visible.length ? (
        <p className="py-10 text-center text-sm text-[#8b949e]">No assignments here.</p>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <AssignmentCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <AssignmentsTable assignments={visible} />
      )}
    </div>
  );
}