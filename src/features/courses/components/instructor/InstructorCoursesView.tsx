import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { StatCard } from "../../../../components/ui/StatCard";
import { ViewToggle, type View } from "../../../../components/ui/ViewToggle";
import type { InstructorCourse, InstructorCourseStatus } from "../../types/types";
import { CourseGrid } from "./CourseGrid";
import { CourseTable } from "./CourseTable";

type Filter = "all" | InstructorCourseStatus;

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function InstructorCoursesView({ courses }: { courses: InstructorCourse[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("table");

  // "All" hides archived courses; they have their own tab
  const live = useMemo(() => courses.filter((c) => c.status !== "archived"), [courses]);

  const stats = useMemo(() => {
    const published = live.filter((c) => c.status === "published");
    return {
      total: live.length,
      published: published.length,
      drafts: live.filter((c) => c.status === "draft").length,
      students: live.reduce((sum, c) => sum + c.students, 0),
      noCohort: published.filter((c) => c.cohorts === 0),
    };
  }, [live]);

  const counts: Record<Filter, number> = {
    all: live.length,
    published: stats.published,
    draft: stats.drafts,
    archived: courses.length - live.length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (filter === "all" ? c.status !== "archived" : c.status === filter) &&
        (q === "" || c.title.toLowerCase().includes(q) || c.language.toLowerCase().includes(q)),
    );
  }, [courses, filter, query]);

  const noCohortHint =
    stats.noCohort.length === 1
      ? `${stats.noCohort[0].title} has no cohort yet`
      : stats.noCohort.length > 1
        ? `${stats.noCohort.length} published courses have no cohort`
        : "Every published course has a cohort";

  // TODO: replace with real endpoints, routes and toasts
  const publish = (c: InstructorCourse) => console.log("publish", c.id);
  const createCohort = (c: InstructorCourse) => console.log("create cohort for", c.id);
  const openMenu = (c: InstructorCourse) => console.log("menu", c.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-50">Courses</h1>
          <p className="mt-1 text-sm text-gray-400">Build your courses, then run them as cohorts.</p>
        </div>
        <Button onClick={() => console.log("create course")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Create course
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total courses" value={stats.total} hint="Not counting archived" />
        <StatCard label="Published" value={stats.published} hint={`${stats.drafts} still in draft`} />
        <StatCard label="Total students" value={stats.students} hint="Across all cohorts" />
        <StatCard
          label="Needs attention"
          value={stats.noCohort.length}
          hint={noCohortHint}
          tone={stats.noCohort.length > 0 ? "warning" : "default"}
        />
      </div>

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
                  active ? "border-sky-400 text-sky-300" : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {t.label}
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{counts[t.value]}</span>
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
            <span className="sr-only">Search courses</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              className="w-44 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
            />
          </label>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {view === "table" ? (
        <CourseTable courses={visible} onPublish={publish} onCreateCohort={createCohort} onOpenMenu={openMenu} />
      ) : (
        <CourseGrid courses={visible} onPublish={publish} onCreateCohort={createCohort} onOpenMenu={openMenu} />
      )}
    </div>
  );
}
