import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Cohort, CohortStatus } from "../../types/types";


export type EnrolInfo = Pick<Cohort, "status" | "startsOn" | "durationLabel" | "price"> &
  Partial<Pick<Cohort, "seatsTaken" | "seatsTotal">>;

export const STATUS_STYLES: Record<CohortStatus, { label: string; badge: string }> = {
    open: { label: "Open", badge: "bg-[#3fb950]/15 text-success" },
    "starting-soon": { label: "Starting soon", badge: "bg-[#d29922]/15 text-warning" },
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
}

export function CohortCard({ cohort }: CohortCardProps) {
    const { id, status, name, subtitle, startsOn, durationLabel, seatsTaken, seatsTotal, price } = cohort;
    const isFull = seatsTaken >= seatsTotal;
    const pct = Math.min(100, (seatsTaken / seatsTotal) * 100);
    const s = STATUS_STYLES[status];
    console.log(id)


    return (
        <article className="flex flex-col rounded-xl border border-line bg-surface p-5">
            <span className={`w-fit rounded-full px-2 py-0.5 text-xs ${s.badge}`}>{s.label}</span>

            <h3 className="mt-3 text-lg font-medium text-foreground">{name}</h3>
            <p className="text-sm text-muted">{subtitle}</p>

            <div className="mt-4 flex gap-4 text-xs text-body">
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
                {isFull ? `Full, ${seatsTotal} of ${seatsTotal} seats taken` : `${seatsTaken} of ${seatsTotal} seats taken`}
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

            <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-sm text-foreground">{formatNaira(price)}</span>
                <Link
                    to={`/cohort/${id}`}
                    className={
                        isFull
                            ? "rounded-lg border border-line px-3 py-1.5 text-xs text-body hover:border-[#8b949e]"
                            : "rounded-lg bg-[#238636] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#2ea043]"
                    }
                >
                    View
                </Link>
            </div>
        </article>
    );
}