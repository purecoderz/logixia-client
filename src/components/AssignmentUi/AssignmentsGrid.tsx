// components/Assignments/AssignmentsGrid.tsx
import { useMemo, useState } from "react";
import { FilterTabs } from "../Cohorts/FilterTabs";
import type { Assignment, AssignmentStatus } from "../../services/assignmentService";
import { AssignmentCard } from "./AssignmentCard";


type Filter = "all" | AssignmentStatus;



const RANK: Record<AssignmentStatus, number> = { active: 0, missed: 1, done: 2 };



export function AssignmentsGrid({ assignments }: { assignments: Assignment[] }) {
  const [filter, setFilter] = useState<Filter>("all");

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

  return (
    <div className="space-y-4">
      <FilterTabs options={options} value={filter} onChange={setFilter} />

      {visible.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <AssignmentCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-[#8b949e]">No assignments here.</p>
      )}
    </div>
  );
}