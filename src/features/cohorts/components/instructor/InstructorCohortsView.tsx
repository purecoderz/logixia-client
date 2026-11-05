import { ActionNotice, type Notice } from "@/features/courses/components/instructor/ActionNotice";
import { friendlyMessage } from "@/lib/apiError";
import { useUpdateCohortPublication } from "../../hooks/useCohorts";
import { useCallback, useMemo, useRef, useState } from "react";
import type { InstructorCohort, InstructorCohortStatus } from "../../types/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ViewToggle, type View } from "@/components/ui/ViewToggle";
import { StatCard } from "../../../../components/ui/StatCard";
import { formatNaira } from "../../../../utils/format";
import { CohortTable } from "./CohortTable";
import { CohortGrid } from "./CohortGrid";


type Filter = "all" | InstructorCohortStatus;

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "starting-soon", label: "Starting soon" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const fillPct = (c: InstructorCohort) => c.seatsTotal > 0 ? Math.round((c.seatsTaken / c.seatsTotal) * 100) : 0;

export function CohortsPage({ cohorts }: { cohorts: InstructorCohort[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("table");

  const publication = useUpdateCohortPublication();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const running = useRef(false);
  const dismiss = useCallback(() => setNotice(null), []);

  async function setPublished(c: InstructorCohort, isPublished: boolean) {
    if (running.current) return;
    running.current = true;
    setBusyId(c.id);
    setNotice(null);
    try {
      await publication.mutateAsync({ id: c.id, isPublished });
      setNotice({ kind: "success", message: isPublished ? `“${c.name}” is published.` : `“${c.name}” is back to draft.` });
    } catch (error) {
      setNotice({ kind: "error", message: friendlyMessage(error, `Couldn’t ${isPublished ? "publish" : "unpublish"} “${c.name}”. Please try again.`) });
    } finally {
      running.current = false;
      setBusyId(null);
    }
  }

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

  async function copyLink(c: InstructorCohort) {
    setNotice(null);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/cohort/${c.id}`);
      setNotice({ kind: "success", message: `Link to “${c.name}” copied.` });
    } catch {
      setNotice({ kind: "error", message: "Couldn’t copy the link. Please try again.", link: { label: "Open cohort", to: `/cohort/${c.id}` } });
    }
  }

  const actions = {
    busyId,
    onCopyLink: (c: InstructorCohort) => void copyLink(c),
    onPublish: (c: InstructorCohort) => void setPublished(c, true),
    onUnpublish: (c: InstructorCohort) => void setPublished(c, false),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-50">Cohorts</h1>
          <p className="mt-1 text-sm text-gray-400">Manage enrollment, schedules and revenue across your courses.</p>
        </div>
        <ButtonLink to="/instructor/cohorts/new">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Create cohort
        </ButtonLink>
      </div>

      <ActionNotice notice={notice} onDismiss={dismiss} />

      {cohorts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-800/30 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-50">Create your first cohort</h2>
          <p className="max-w-md text-sm text-gray-400">Run a course with a group of students, set your schedule, and open enrollment.</p>
          <ButtonLink to="/instructor/cohorts/new">Create cohort</ButtonLink>
        </div>
      ) : <>
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

        <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {view === "table" ? (
        <CohortTable cohorts={visible} {...actions} />
      ) : (
        <CohortGrid cohorts={visible} {...actions} />
      )}
      </>}
    </div>
  );
}
