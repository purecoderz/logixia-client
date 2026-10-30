import type { InstructorCohort } from "../../../types/cohort";
import { formatDateRange } from "../../../utils/format";
import { ProgressBar } from "../../ui/ProgressBar";


export function ScheduleSummary({ cohort: c }: { cohort: InstructorCohort }) {
  if (c.status !== "in-progress") {
    return <p className="text-sm font-medium">{formatDateRange(c.startDate, c.endDate)}</p>;
  }

  return (
    <div>
      <p className="text-sm font-medium">
        Week {c.currentWeek} of {c.totalWeeks}
      </p>
      <div className="my-1.5">
        <ProgressBar value={c.currentWeek ?? 0} max={c.totalWeeks} label="Course progress" />
      </div>
      <p className="text-xs text-gray-400">
        {formatDateRange(c.startDate, c.endDate)}
        {c.nextSession && ` · Next: ${c.nextSession}`}
      </p>
    </div>
  );
}