import type { Assignment } from "../../services/assignmentService";
import { DashboardCard, SeeAllLink } from "./DashboardCard";
import { DateRow } from "./DateRow";

export function PastDueCard({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) return null;

  return (
    <DashboardCard title="Past due" action={<SeeAllLink />}>
      <div className="space-y-2">
        {assignments.map((a) => (
          <DateRow key={a.id} a={a} />
        ))}
      </div>
    </DashboardCard>
  );
}