import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { CohortService, type CohortStatus } from "../Services/cohortService";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { SearchBar } from "@/components/ui/SearchBar";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { CohortCard } from "../components/students/CohortCard";
import { useActiveCohort } from "../hooks/useActiveCohort";

type Filter = "all" | CohortStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "starting-soon", label: "Starting soon" },
  { value: "in-progress", label: "In progress" },
];

// ── Active cohort mini-card shown in the hero section ──────────────────────
function ActiveCohortCard({
  id,
  name,
  currentWeek,
  totalWeeks,
  nextSession,
  course,
}: {
  id: string;
  name: string;
  currentWeek?: number;
  totalWeeks?: number;
  nextSession?: string;
  course: string;
}) {
  const pct =
    currentWeek && totalWeeks
      ? Math.round((currentWeek / totalWeeks) * 100)
      : null;

  return (
    <article className="student-card flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
          In progress
        </span>
        {currentWeek && totalWeeks && (
          <span className="font-mono text-xs text-muted">
            Week {currentWeek}/{totalWeeks}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <p className="mt-0.5 text-xs text-muted">{course}</p>
      </div>

      {pct !== null && (
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name} progress`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-hover"
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        {nextSession && (
          <span className="flex items-center gap-1">
            <Calendar size={12} aria-hidden />
            Next: {nextSession}
          </span>
        )}
        <span className="flex items-center gap-1">
          <BookOpen size={12} aria-hidden />
          {totalWeeks} weeks total
        </span>
      </div>

      <Link
        to={`/student/cohort/${id}`}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-accent py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        Go to dashboard <ArrowRight size={14} aria-hidden />
      </Link>
    </article>
  );
}

// ── Starting-soon cohort mini-card ─────────────────────────────────────────
function StartingSoonCard({
  id,
  name,
  course,
  startsOn,
  seatsTaken,
  seatsTotal,
}: {
  id: string;
  name: string;
  course: string;
  startsOn: string;
  seatsTaken: number;
  seatsTotal: number;
}) {
  const pct =
    seatsTotal > 0
      ? Math.min(100, Math.round((seatsTaken / seatsTotal) * 100))
      : 0;

  return (
    <article className="student-card flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <span className="w-fit rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning">
        Starting soon
      </span>

      <div>
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <p className="mt-0.5 text-xs text-muted">{course}</p>
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>
            {seatsTaken} of {seatsTotal} seats taken
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={seatsTaken}
          aria-valuemin={0}
          aria-valuemax={seatsTotal}
          aria-label={`${name} seats`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-hover"
        >
          <div
            className="h-full rounded-full bg-success"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Calendar size={12} aria-hidden />
          Starts {startsOn}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden />
          {seatsTotal - seatsTaken} seats left
        </span>
      </div>

      <Link
        to={`/student/cohort/${id}`}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-line py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-foreground"
      >
        View details <ArrowUpRight size={14} aria-hidden />
      </Link>
    </article>
  );
}

// ── Stats pill ──────────────────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
}: {
  icon: typeof Users;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
      <Icon size={13} className="text-accent" aria-hidden />
      {label}
    </span>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function StudentCohortsPage() {
  const membership = useActiveCohort();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const {
    data: publicCohorts = [],
    isPending: isPublicLoading,
    error: publicError,
    refetch,
  } = useQuery({
    queryKey: ["cohorts", "public"],
    queryFn: () => CohortService.getCohorts(),
  });

  const enrolled = membership.cohorts;

  // Catalog: exclude cohorts the student is already enrolled in
  // Public cohort IDs are prefixed with "c" (e.g. "c42"), while CohortOption ids are plain numbers.
  const enrolledIds = new Set(enrolled.map((c) => `c${c.id}`));
  const catalogCohorts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publicCohorts.filter(
      (c) =>
        !enrolledIds.has(c.id) &&
        (filter === "all" || c.status === filter) &&
        (!q || `${c.name} ${c.subtitle}`.toLowerCase().includes(q)),
    );
  }, [publicCohorts, enrolledIds, filter, query]);

  // Cross-reference enrolled cohort ids with public cohort data for rich display
  const enrichedEnrolled = useMemo(
    () =>
      enrolled
        .map((e) => {
          const pub = publicCohorts.find((p) => p.id === `c${e.id}`);
          return pub ? { option: e, pub } : null;
        })
        .filter(Boolean) as { option: (typeof enrolled)[0]; pub: (typeof publicCohorts)[0] }[],
    [enrolled, publicCohorts],
  );

  const inProgress = enrichedEnrolled.filter(
    ({ pub }) => pub.status === "in-progress",
  );
  const startingSoon = enrichedEnrolled.filter(
    ({ pub }) => pub.status === "starting-soon",
  );
  const hasEnrolled = inProgress.length > 0 || startingSoon.length > 0;

  return (
    <div className="space-y-10">
      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden rounded-xl border border-accent/20 bg-accent/[0.07] p-6 sm:p-8">
        {/* decorative background icon */}
        <Users
          size={96}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-accent/10"
          aria-hidden
        />

        <p className="text-xs font-semibold tracking-[0.18em] text-accent">
          MY COHORTS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your Learning Groups
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
          Track your progress, tasks and upcoming sessions across all your
          cohorts. Find your next group below.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <StatPill
            icon={Users}
            label={`${enrolled.length} ${enrolled.length === 1 ? "cohort" : "cohorts"} joined`}
          />
        </div>
      </section>

      {/* ── Enrolled cohorts ── */}
      {membership.isPending ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Your cohorts
          </h2>
          <CardGridSkeleton label="Loading your cohorts" />
        </section>
      ) : membership.error ? (
        <ErrorState
          what="your cohorts"
          error={membership.error}
          onRetry={() => void membership.refetch()}
          variant="section"
        />
      ) : hasEnrolled ? (
        <section aria-labelledby="enrolled-heading">
          <h2
            id="enrolled-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Your cohorts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map(({ option, pub }) => {
              // durationLabel for in-progress cohorts looks like "Week X of Y"
              const match = pub.durationLabel.match(/Week (\d+) of (\d+)/i);
              const currentWeek = match ? Number(match[1]) : undefined;
              const totalWeeks = match ? Number(match[2]) : undefined;
              return (
                <ActiveCohortCard
                  key={option.id}
                  id={pub.id}
                  name={option.name}
                  course={pub.subtitle}
                  currentWeek={currentWeek}
                  totalWeeks={totalWeeks}
                />
              );
            })}
            {startingSoon.map(({ option, pub }) => (
              <StartingSoonCard
                key={option.id}
                id={pub.id}
                name={option.name}
                course={pub.subtitle}
                startsOn={pub.startsOn}
                seatsTaken={pub.seatsTaken}
                seatsTotal={pub.seatsTotal}
              />
            ))}
          </div>
        </section>
      ) : enrolled.length === 0 ? null : (
        /* enrolled but no public data yet — show placeholders */
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Your cohorts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolled.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                  Enrolled
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {e.name}
                </h3>
                <Link
                  to={`/student/cohort/c${e.id}`}
                  className="mt-4 flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  View cohort <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Browse catalog ── */}
      <section aria-labelledby="browse-heading" className="border-t border-line pt-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              id="browse-heading"
              className="text-lg font-semibold text-foreground"
            >
              {enrolled.length > 0 ? "Browse more cohorts" : "Explore cohorts"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Find a group that fits your next step.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search cohorts"
            />
          </div>
        </div>

        <div className="mb-5">
          <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
        </div>

        {publicError && (
          <ErrorState
            what="cohorts"
            error={publicError}
            onRetry={() => void refetch()}
            variant="section"
          />
        )}

        {isPublicLoading ? (
          <CardGridSkeleton label="Loading cohorts" />
        ) : publicError ? null : catalogCohorts.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {catalogCohorts.map((c) => (
              <CohortCard
                key={c.id}
                cohort={c}
                detailsBasePath="/student/cohort"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line py-14 text-center">
            <Users size={28} className="mx-auto text-muted" aria-hidden />
            <h3 className="mt-4 text-base font-medium text-foreground">
              {query || filter !== "all"
                ? "No matching cohorts"
                : "New cohorts are on the way"}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {query || filter !== "all"
                ? "Try another search or choose a different filter."
                : "Check back soon to find your next learning group."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
