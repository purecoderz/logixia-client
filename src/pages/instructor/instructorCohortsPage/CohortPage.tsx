"use client"; // needed in Next.js App Router; harmless elsewhere

import { useMemo, useState } from "react";
import type { InstructorCohort, InstructorCohortStatus } from "../../../features/cohorts/types/types";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../features/cohorts/components/instructor/StatCard";
import { formatNaira } from "../../../utils/format";
import { CohortTable } from "../../../features/cohorts/components/instructor/CohortTable";
import { CohortGrid } from "../../../features/cohorts/components/instructor/CohortGrid";
import { mockCohorts } from "../mock";


type Filter = "all" | InstructorCohortStatus;
type View = "table" | "grid";

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "starting-soon", label: "Starting soon" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const fillPct = (c: InstructorCohort) => Math.round((c.seatsTaken / c.seatsTotal) * 100);

export function CohortsPage({ cohorts=mockCohorts }: { cohorts: InstructorCohort[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("table");

  // Stats are always for ALL cohorts, not the filtered view
  const stats = useMemo(() => {
    const students = cohorts.reduce((sum, c) => sum + c.seatsTaken, 0);
    const seats = cohorts.reduce((sum, c) => sum + c.seatsTotal, 0);
    const revenue = cohorts.reduce((sum, c) => sum + c.seatsTaken * c.price, 0);
    const attention = cohorts.filter(
      (c) => (c.status === "open" || c.status === "starting-soon") && fillPct(c) < 50,
    );
    return { students, seats, revenue, attention };
  }, [cohorts]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: cohorts.length };
    for (const c of cohorts) map[c.status] = (map[c.status] ?? 0) + 1;
    return map;
  }, [cohorts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cohorts.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (q === "" || c.name.toLowerCase().includes(q) || c.course.toLowerCase().includes(q)),
    );
  }, [cohorts, filter, query]);

  const attentionHint =
    stats.attention.length === 1
      ? `${stats.attention[0].name} is ${fillPct(stats.attention[0])}% filled`
      : stats.attention.length > 1
        ? `${stats.attention.length} cohorts are under 50% filled`
        : "All cohorts are on track";

  // TODO: replace with your real endpoints / toasts
  const copyLink = (c: InstructorCohort) => navigator.clipboard.writeText(`${window.location.origin}/enroll/${c.id}`);
  const publish = (c: InstructorCohort) => console.log("publish", c.id);
  const openMenu = (c: InstructorCohort) => console.log("menu", c.id);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-50">Cohorts</h1>
          <p className="mt-1 text-sm text-gray-400">Manage enrollment, schedules and revenue across your courses.</p>
        </div>
        <Button onClick={() => console.log("create cohort")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Create cohort
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={stats.students} hint={`Across ${cohorts.length} cohorts`} />
        <StatCard
          label="Seats filled"
          value={stats.seats ? `${Math.round((stats.students / stats.seats) * 100)}%` : "—"}
          hint={`${stats.students} of ${stats.seats} seats`}
        />
        <StatCard label="Expected revenue" value={formatNaira(stats.revenue)} hint="From current enrollments" />
        <StatCard
          label="Needs attention"
          value={stats.attention.length}
          hint={attentionHint}
          tone={stats.attention.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800">
        <div className="flex flex-wrap">
          {tabs.map((t) => {
            const active = filter === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(t.value)}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-sky-400 text-sky-300"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {t.label}
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                  {counts[t.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-2 flex items-center gap-2">
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 focus-within:border-sky-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-gray-400" aria-hidden="true">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <span className="sr-only">Search cohorts</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cohorts"
            className="w-44 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
        </label>

        <div className="flex rounded-lg border border-gray-700 p-0.5" role="group" aria-label="View">
          {(["grid", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === "grid" ? "Grid view" : "Table view"}
              onClick={() => setView(v)}
              className={`flex size-10 items-center justify-center rounded-md transition-colors ${
                view === v ? "bg-sky-400/15 text-sky-300" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {v === "grid" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h12" />
                </svg>
              )}
            </button>
          ))}
        </div>
        </div>
      </div>

      {view === "table" ? (
        <CohortTable cohorts={visible} onCopyLink={copyLink} onPublish={publish} onOpenMenu={openMenu} />
      ) : (
        <CohortGrid cohorts={visible} onCopyLink={copyLink} onPublish={publish} onOpenMenu={openMenu} />
      )}
    </div>
  );
}