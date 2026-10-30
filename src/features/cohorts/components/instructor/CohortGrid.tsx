import type { InstructorCohort } from "../../types/types";
import { InstructorCohortCard } from "./InstructorCohortCard";


interface CohortGridProps {
  cohorts: InstructorCohort[];
  onCopyLink: (cohort: InstructorCohort) => void;
  onPublish: (cohort: InstructorCohort) => void;
  onOpenMenu: (cohort: InstructorCohort) => void;
}

export function CohortGrid({ cohorts, ...actions }: CohortGridProps) {
  if (cohorts.length === 0) {
    return (
      <p className="rounded-xl border border-gray-800 bg-gray-800/30 px-5 py-12 text-center text-sm text-gray-400">
        No cohorts match your filters.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cohorts.map((c) => (
        <InstructorCohortCard key={c.id} cohort={c} {...actions} />
      ))}
    </div>
  );
}