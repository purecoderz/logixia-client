import { Link } from "react-router-dom";
import type { Tutorial, TutorialLevel } from "../../../services/LecturesService";


const LEVELS: Record<TutorialLevel, { label: string; bars: number }> = {
  beginner: { label: "Beginner", bars: 1 },
  intermediate: { label: "Intermediate", bars: 2 },
  advanced: { label: "Advanced", bars: 3 },
};

function LevelMeter({ level }: { level: TutorialLevel }) {
  const { label, bars } = LEVELS[level];

  return (
    <div className="flex items-center gap-2 text-[13px] text-[#8b949e]">
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`w-1 rounded-sm ${n <= bars ? "bg-[#3fb950]" : "bg-[#30363d]"}`}
            style={{ height: 4 + n * 3 }}
          />
        ))}
      </span>
      {label}
    </div>
  );
}

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // change to your currency
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}

export function LectureCard({ tutorial }: { tutorial: Tutorial }) {
  const isFree = tutorial.price === 0;

  return (
    <Link
      to={`/tutorials/${tutorial.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] transition-colors hover:border-[#3fb950]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
    >
      {/* Editor-window header */}
      <div className="flex items-center gap-1.5 border-b border-[#21262d] bg-[#161b22] px-3 py-2">
        <span className="size-2 rounded-full bg-[#30363d] transition-colors group-hover:bg-[#f85149]" />
        <span className="size-2 rounded-full bg-[#30363d] transition-colors group-hover:bg-[#d29922]" />
        <span className="size-2 rounded-full bg-[#30363d] transition-colors group-hover:bg-[#3fb950]" />
        <span className="ml-2 truncate font-mono text-xs text-[#8b949e]">
          {tutorial.slug}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {tutorial.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#8b949e]">
          {tutorial.subtitle}
        </p>
        <p className="mt-3 text-[13px] text-[#8b949e]">
          by <span className="text-[#c9d1d9]">{tutorial.instructor.name}</span>
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#21262d] pt-3 mt-4">
          <LevelMeter level={tutorial.level} />
          <span
            className={`text-sm font-semibold ${isFree ? "text-[#3fb950]" : "text-white"}`}
          >
            {formatPrice(tutorial.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}