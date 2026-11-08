import type { CohortActionProps } from "./CohortActions";
import { Link } from "react-router-dom";
import type { InstructorCohort } from "../../types/types";
import { formatNaira } from "@/utils/format";
import { CohortActions } from "./CohortActions";
import { ScheduleSummary } from "./ScheduleSummary";
import { SeatsSummary } from "./SeatsSummary";
import { CohortStatusChip } from "./CohortStatusChip";

interface InstructorCohortCardProps extends CohortActionProps {
  cohort: InstructorCohort;
}

export function InstructorCohortCard({
  cohort: c,
  ...actions
}: InstructorCohortCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface-muted/30 p-5 hover:border-line">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/cohort/${c.id}`}
            className="break-words font-semibold text-foreground hover:text-accent hover:underline"
          >
            {c.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted">{c.course}</p>
        </div>
        <CohortStatusChip status={c.status} />
      </div>

      <ScheduleSummary cohort={c} />
      <SeatsSummary cohort={c} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">Revenue</p>
          <p className="text-sm font-semibold text-foreground">
            {formatNaira(c.seatsTaken * c.price)}
          </p>
        </div>
        <CohortActions cohort={c} {...actions} />
      </div>
    </article>
  );
}
