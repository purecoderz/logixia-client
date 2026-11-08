import type {
  Assignment,
  AssignmentStatus,
} from "@/features/assignments/services/assignmentService";
import { DashboardCard } from "./DashboardCard";
import { ProgressRing } from "./ProgressRing";

const RINGS: { status: AssignmentStatus; label: string; color: string }[] = [
  {
    status: "done",
    label: "Completed",
    color: "var(--student-chart-success, #3fb950)",
  },
  {
    status: "active",
    label: "Active",
    color: "var(--student-chart-active, #58a6ff)",
  },
  {
    status: "incomplete",
    label: "Incomplete",
    color: "var(--student-chart-warning, #d29922)",
  },
  {
    status: "missed",
    label: "Missed",
    color: "var(--student-chart-danger, #f85149)",
  },
];

export function ProgressCard({ assignments }: { assignments: Assignment[] }) {
  const total = assignments.length;
  const pct = (s: AssignmentStatus) =>
    total
      ? Math.round(
          (assignments.filter((a) => a.uiStatus === s).length / total) * 100,
        )
      : 0;

  return (
    <DashboardCard title="Progress">
      <div className="grid grid-cols-2 place-items-center gap-x-4 gap-y-5">
        {RINGS.map((r) => (
          <ProgressRing
            key={r.status}
            label={r.label}
            color={r.color}
            pct={pct(r.status)}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
