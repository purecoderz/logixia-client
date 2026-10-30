type Tone = "default" | "warning" | "success";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  /** Accessible name, e.g. "Seats filled" or "Course progress". */
  label: string;
}

const fills: Record<Tone, string> = {
  default: "bg-sky-400",
  warning: "bg-amber-400",
  success: "bg-emerald-400",
};

export function ProgressBar({ value, max = 100, tone = "default", label }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700"
    >
      <div
        className={`h-full rounded-full transition-[width] ${fills[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}