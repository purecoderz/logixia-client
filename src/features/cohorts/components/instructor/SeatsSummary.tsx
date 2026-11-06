import type { InstructorCohort } from "../../types/types";
import { ProgressBar } from "../../../../components/ui/ProgressBar";

export function SeatsSummary({ cohort: c }: { cohort: InstructorCohort }) {
  const full = c.seatsTotal > 0 && c.seatsTaken >= c.seatsTotal;
  const pct = c.seatsTotal > 0 ? Math.round((c.seatsTaken / c.seatsTotal) * 100) : 0;
  const lowFill = !full && pct < 50 && (c.status === "open" || c.status === "starting-soon");

  return (
    <div>
      <p className="text-sm font-medium">
        {c.seatsTaken} / {c.seatsTotal}
        {full && <span className="ml-2 text-xs text-success">Full</span>}
      </p>
      <div className="my-1.5">
        <ProgressBar
          value={c.seatsTaken}
          max={c.seatsTotal}
          tone={lowFill ? "warning" : full ? "success" : "default"}
          label="Seats filled"
        />
      </div>
      <p className={`text-xs ${lowFill ? "text-warning" : "text-muted"}`}>{pct}% filled</p>
    </div>
  );
}
