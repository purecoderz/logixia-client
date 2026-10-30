interface ProgressRingProps {
  pct: number;
  color: string;
  label: string;
}

export function ProgressRing({ pct, color, label }: ProgressRingProps) {
  const r = 28;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-[76px]">
        <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden>
          <circle cx="36" cy="36" r={r} fill="none" stroke="#21262d" strokeWidth="7" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">
          {pct}%
        </span>
      </div>
      <span className="text-xs text-[#8b949e]">{label}</span>
    </div>
  );
}