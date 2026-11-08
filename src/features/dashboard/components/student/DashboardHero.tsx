import { useTheme } from "../../../theme/ThemeProvider";
// components/Dashboard/DashboardHero.tsx
import { HeroIllustration } from "./herosvg";

interface DashboardHeroProps {
  name: string;
  dueCount: number;
  onReview?: () => void;
}

export function DashboardHero({
  name,
  dueCount,
  onReview,
}: DashboardHeroProps) {
  const { theme } = useTheme();
  return (
    <section className="student-dashboard-hero overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.08] p-5 sm:p-6 md:p-8">
      <div className="flex items-center gap-6 md:gap-8">
        {/* Text takes whatever space the illustration leaves */}
        <div className="min-w-0 flex-1">
          <h1
            title={`Hello ${name}!`}
            className="truncate text-xl font-bold text-foreground sm:text-2xl lg:text-3xl"
          >
            Hello {name}!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-body lg:text-base">
            {dueCount > 0
              ? `Welcome back! You have ${dueCount} ${dueCount === 1 ? "task" : "tasks"} due soon. Keep the energy up. Let's get started.`
              : "You're all caught up. Nice work."}
          </p>
          {dueCount > 0 && (
            <button
              type="button"
              onClick={onReview}
              className="student-review-button mt-4 rounded-lg bg-[#142844] px-4 py-2 text-sm font-semibold text-white transition-colors hover:cursor-pointer hover:bg-[#388bfd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Review it
            </button>
          )}
        </div>

        {/* Fixed, responsive width; never shrinks, never overlaps the text */}
        {theme === "light" ? (
          <img
            src="/dashhero-light.svg"
            alt=""
            aria-hidden="true"
            width={800}
            height={573}
            className="pointer-events-none hidden h-auto w-44 shrink-0 md:block lg:w-60 xl:w-72"
          />
        ) : (
          <HeroIllustration
            aria-hidden
            role="presentation"
            className="pointer-events-none hidden h-auto w-44 shrink-0 md:block lg:w-60 xl:w-72"
          />
        )}
      </div>
    </section>
  );
}
