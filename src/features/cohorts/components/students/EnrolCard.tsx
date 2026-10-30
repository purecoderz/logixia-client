import type { EnrolInfo } from "./CohortCard";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

interface Props {
  cohort: EnrolInfo;
  totalWeeks: number;
  onAction?: () => void;
}

function useEnrol(cohort: EnrolInfo) {
  const { seatsTaken, seatsTotal } = cohort;

  // the details API doesn't send seats yet, so this stays false until it does
  const hasSeats = seatsTaken != null && seatsTotal != null && seatsTotal > 0;

  const taken = seatsTaken ?? 0;
  const total = seatsTotal ?? 0;
  const left = hasSeats ? Math.max(0, total - taken) : 0;
  const isFull = hasSeats && left === 0;

  return {
    hasSeats,
    taken,
    total,
    left,
    isFull,
    pct: hasSeats ? Math.min(100, (taken / total) * 100) : 0,
    cta: isFull ? "Join waitlist" : "Register now",
  };
}

export function EnrolCard({ cohort, totalWeeks, onAction }: Props) {
  const { hasSeats, taken, total, left, isFull, pct, cta } = useEnrol(cohort);

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
      <p className="text-3xl font-semibold text-white">{formatNaira(cohort.price)}</p>
      <p className="mt-1 text-[13px] text-[#8b949e]">One-time payment for all {totalWeeks} weeks</p>

      {hasSeats && (
        <>
          <div className="mt-5 flex justify-between font-mono text-xs">
            <span>{taken} of {total} seats taken</span>
            <span className={isFull ? "text-[#8b949e]" : "text-[#3fb950]"}>
              {isFull ? "Full" : `${left} left`}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#21262d]">
            <div
              className={`h-full rounded-full ${isFull ? "bg-[#8b949e]" : "bg-[#3fb950]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      )}

      <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 text-[13px]">
        <dt className="text-[#8b949e]">Starts</dt><dd className="text-white">{cohort.startsOn}</dd>
        <dt className="text-[#8b949e]">Duration</dt><dd className="text-white">{totalWeeks} weeks</dd>
        <dt className="text-[#8b949e]">Format</dt><dd className="text-white">Weekly live classes</dd>
      </dl>

      <button
        onClick={() => onAction?.()}
        className={`mt-6 min-h-11 w-full rounded-lg text-[15px] font-medium ${
          isFull
            ? "border border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]"
            : "bg-[#238636] text-white hover:bg-[#2ea043]"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

export function MobileEnrolBar({ cohort, onAction }: Omit<Props, "totalWeeks">) {
  const { isFull, cta } = useEnrol(cohort);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 border-t border-[#30363d] bg-[#0d1117]/95 px-4 py-3 backdrop-blur lg:hidden">
      <span className="text-lg font-semibold text-white">{formatNaira(cohort.price)}</span>
      <button
        onClick={() => onAction?.()}
        className={`min-h-11 rounded-lg px-5 text-sm font-medium ${
          isFull ? "border border-[#30363d] text-[#c9d1d9]" : "bg-[#238636] text-white"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}