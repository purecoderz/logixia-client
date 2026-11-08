import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Cohort, CohortStatus } from "../../types/types";

export type EnrolInfo = Pick<
  Cohort,
  "status" | "startsOn" | "durationLabel" | "price"
> &
  Partial<Pick<Cohort, "seatsTaken" | "seatsTotal">>;

export const STATUS_STYLES: Record<
  CohortStatus,
  { label: string; badge: string }
> = {
  open: { label: "Open", badge: "bg-[#3fb950]/15 text-success" },
  "starting-soon": {
    label: "Starting soon",
    badge: "bg-[#d29922]/15 text-warning",
  },
  "in-progress": { label: "In progress", badge: "bg-accent/15 text-accent" },
  completed: { label: "Completed", badge: "bg-[#8b949e]/15 text-muted" },
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

interface CohortCardProps {
  cohort: Cohort;
  detailsBasePath?: string;
}

export function CohortCard({
  cohort,
  detailsBasePath = "/cohort",
}: CohortCardProps) {
  const {
    id,
    status,
    name,
    subtitle,
    startsOn,
    durationLabel,
    seatsTaken,
    seatsTotal,
    price,
  } = cohort;
  const isFull = seatsTaken >= seatsTotal;
  const pct =
    seatsTotal > 0
      ? Math.min(100, Math.max(0, (seatsTaken / seatsTotal) * 100))
      : 0;
  const s = STATUS_STYLES[status];

  return (
    <article className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-7">
      <span className={`w-fit rounded-full px-2 py-0.5 text-xs ${s.badge}`}>
        {s.label}
      </span>

      <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-body">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="text-muted" />
          {startsOn}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-muted" />
          {durationLabel}
        </span>
      </div>

      <p className="mt-4 text-xs text-muted">
        {isFull
          ? `Full, ${seatsTotal} of ${seatsTotal} seats taken`
          : `${seatsTaken} of ${seatsTotal} seats taken`}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={seatsTotal}
        aria-valuenow={seatsTaken}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hover"
      >
        <div
          className={`h-full rounded-full ${isFull ? "bg-[#8b949e]" : "bg-[#3fb950]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
        <span className="text-lg font-semibold text-foreground">
          {price === 0 ? "Free" : formatNaira(price)}
        </span>
        <Link
          to={`${detailsBasePath}/${id}`}
          className={
            isFull
              ? "inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm text-body hover:border-line-strong"
              : "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          }
        >
          View cohort <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
