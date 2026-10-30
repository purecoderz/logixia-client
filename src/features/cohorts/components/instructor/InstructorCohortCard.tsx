import type { InstructorCohort } from "../../types/types";
import { formatNaira } from "@/utils/format";
import { StatusChip } from "../../../../components/ui/StatusChip"
import { CohortActions } from "./CohortActions";
import { ScheduleSummary } from "./ScheduleSummary";
import { SeatsSummary } from "./SeatsSummary";


interface InstructorCohortCardProps {
  cohort: InstructorCohort;
  onCopyLink: (cohort: InstructorCohort) => void;
  onPublish: (cohort: InstructorCohort) => void;
  onOpenMenu: (cohort: InstructorCohort) => void;
}

export function InstructorCohortCard({ cohort: c, ...actions }: InstructorCohortCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-800/30 p-5 hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Swap for your router's <Link> */}
          <a href={`/cohorts/${c.id}`} className="break-words font-semibold text-gray-50 hover:text-sky-300 hover:underline">
            {c.name}
          </a>
          <p className="mt-0.5 text-xs text-gray-400">{c.course}</p>
        </div>
        <StatusChip status={c.status} />
      </div>

      <ScheduleSummary cohort={c} />
      <SeatsSummary cohort={c} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4">
        <div>
          <p className="text-xs text-gray-400">Revenue</p>
          <p className="text-sm font-semibold text-gray-100">{formatNaira(c.seatsTaken * c.price)}</p>
        </div>
        <CohortActions cohort={c} {...actions} />
      </div>
    </article>
  );
}