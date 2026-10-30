import type { InstructorCohort } from "../../types/types";
import { ProgressBar } from "../../../../components/ui/ProgressBar";

export function SeatsSummary({ cohort: c }: { cohort: InstructorCohort }) {
  const full = c.seatsTaken >= c.seatsTotal;
  const pct = Math.round((c.seatsTaken / c.seatsTotal) * 100);
  const lowFill = !full && pct < 50 && (c.status === "open" || c.status === "starting-soon");

  return (
    <div>
      <p className="text-sm font-medium">
        {c.seatsTaken} / {c.seatsTotal}
        {full && <span className="ml-2 text-xs text-emerald-300">Full</span>}
      </p>
      <div className="my-1.5">
        <ProgressBar
          value={c.seatsTaken}
          max={c.seatsTotal}
          tone={lowFill ? "warning" : full ? "success" : "default"}
          label="Seats filled"
        />
      </div>
      <p className={`text-xs ${lowFill ? "text-amber-300" : "text-gray-400"}`}>{pct}% filled</p>
    </div>
  );
}