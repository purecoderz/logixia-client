import { BookOpen } from "lucide-react";
import type {
  Tutorial,
  TutorialLevel,
} from "../../../pages/Lectures/LecturesService";

const LEVELS: Record<TutorialLevel, { label: string; bars: number }> = {
  beginner: { label: "Beginner", bars: 1 },
  intermediate: { label: "Intermediate", bars: 2 },
  advanced: { label: "Advanced", bars: 3 },
};

function LevelMeter({ level }: { level: TutorialLevel }) {
  const { label, bars } = LEVELS[level];

  return (
    <div className="flex items-center gap-2 text-[13px] text-muted">
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`w-1 rounded-sm ${n <= bars ? "bg-[#3fb950]" : "bg-surface-muted"}`}
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
    currency: "USD",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}

export function LectureCard({ tutorial }: { tutorial: Tutorial }) {
  const isFree = tutorial.price === 0;

  return (
    <article className="student-catalog-card group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-input text-cyan-500">
          <BookOpen size={22} />
        </span>
        <LevelMeter level={tutorial.level} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {tutorial.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {tutorial.subtitle}
        </p>
        <p className="mt-5 mb-6 text-xs text-muted">
          by <span className="text-body">{tutorial.instructor.name}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5">
          <span
            className={`text-sm font-semibold ${isFree ? "text-success" : "text-foreground"}`}
          >
            {formatPrice(tutorial.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
