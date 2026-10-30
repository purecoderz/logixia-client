import type { Assignment } from "../../services/assignmentService";
import { DashboardCard, EmptyState, SeeAllLink } from "./DashboardCard";
import { DateRow } from "./DateRow";

export function UpcomingCard({ assignments }: { assignments: Assignment[] }) {
  return (
    <DashboardCard title="Upcoming" action={<SeeAllLink />}>
      {assignments.length === 0 ? (
        <EmptyState>Nothing coming up.</EmptyState>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <DateRow key={a.id} a={a} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}