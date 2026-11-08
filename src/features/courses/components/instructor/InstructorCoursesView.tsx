import { useCallback, useMemo, useState } from "react";
import { ButtonLink } from "../../../../components/ui/ButtonLink";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { StatCard } from "../../../../components/ui/StatCard";
import { ViewToggle, type View } from "../../../../components/ui/ViewToggle";
import { ApiError, friendlyMessage } from "../../../../lib/apiError";
import type {
  InstructorCourse,
  InstructorCourseStatus,
} from "../../types/types";
import { ActionNotice, type Notice } from "./ActionNotice";
import type { CourseHandlers } from "./CourseActions";
import { CourseGrid } from "./CourseGrid";
import { CourseTable } from "./CourseTable";
import { builderPath, NEW_COURSE_PATH } from "../../utils/paths";
import { useUpdateCourse } from "../../hooks/UseUpdateCourse";
import type { CoursePatch } from "../../types/Patch";

type Filter = "all" | InstructorCourseStatus;

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const withStop = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Courses
        </h1>
        <p className="mt-1 text-sm text-muted">
          Build your courses, then run them as cohorts.
        </p>
      </div>
      <ButtonLink to={NEW_COURSE_PATH}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M8 2v12M2 8h12" />
        </svg>
        Create course
      </ButtonLink>
    </div>
  );
}

export function InstructorCoursesView({
  courses,
}: {
  courses: InstructorCourse[];
}) {
  const updateCourse = useUpdateCourse();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("table");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirming, setConfirming] = useState<InstructorCourse | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);

  /** Run one change on one course, then say what happened. */
  async function run(
    course: InstructorCourse,
    patch: CoursePatch,
    text: {
      success: string;
      failure: string;
      fixInBuilder?: boolean;
      undo?: () => void;
    },
  ) {
    setBusyId(course.id);
    setNotice(null);
    try {
      await updateCourse.mutateAsync({ courseId: course.id, patch });
      setNotice({ kind: "success", message: text.success, undo: text.undo });
    } catch (error) {
      if (!(error instanceof ApiError)) console.error(error); // a bug on our side
      // A 400 carries the reason ("Module 3 has no lessons"), so show it; anything else gets the plain line
      const reason = error instanceof ApiError && error.status === 400;
      setNotice({
        kind: "error",
        message: reason
          ? `${text.failure} ${withStop(error.message)}`
          : friendlyMessage(error, `${text.failure} Please try again.`),
        link:
          reason && text.fixInBuilder
            ? { label: "Open builder", to: builderPath(course.id) }
            : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  const restore = (c: InstructorCourse) =>
    run(
      c,
      { is_archived: false },
      {
        success: `“${c.title}” is restored.`,
        failure: `Couldn’t restore “${c.title}”.`,
      },
    );

  const handlers: CourseHandlers = {
    onPublish: (c) =>
      void run(
        c,
        { is_published: true },
        {
          success: `“${c.title}” is published.`,
          failure: `“${c.title}” isn’t ready to publish.`,
          fixInBuilder: true,
        },
      ),
    onUnpublish: (c) =>
      void run(
        c,
        { is_published: false },
        {
          success: `“${c.title}” is back to draft.`,
          failure: `Couldn’t unpublish “${c.title}”.`,
        },
      ),
    onArchive: (c) => setConfirming(c),
    onRestore: (c) => void restore(c),
  };

  async function confirmArchive() {
    const course = confirming;
    if (!course) return;
    await run(
      course,
      { is_archived: true },
      {
        success: `“${course.title}” is archived.`,
        failure: `Couldn’t archive “${course.title}”.`,
        undo: () => void restore(course),
      },
    );
    setConfirming(null);
  }

  // "All" hides archived courses; they have their own tab
  const live = useMemo(
    () => courses.filter((c) => c.status !== "archived"),
    [courses],
  );

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
        (q === "" ||
          c.title.toLowerCase().includes(q) ||
          c.language.toLowerCase().includes(q)),
    );
  }, [courses, filter, query]);

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface-muted/30 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Create your first course
          </h2>
          <p className="max-w-md text-sm text-muted">
            A course is the content: modules, lessons and tasks. Once it’s ready
            you can run it as a cohort with a live instructor.
          </p>
          <ButtonLink to={NEW_COURSE_PATH}>Create course</ButtonLink>
        </div>
      </div>
    );
  }

  const noCohortHint =
    stats.noCohort.length === 1
      ? `${stats.noCohort[0].title} has no cohort yet`
      : stats.noCohort.length > 1
        ? `${stats.noCohort.length} published courses have no cohort`
        : "Every published course has a cohort";

  return (
    <div className="space-y-6">
      <Header />

      <ActionNotice notice={notice} onDismiss={dismiss} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total courses"
          value={stats.total}
          hint="Not counting archived"
        />
        <StatCard
          label="Published"
          value={stats.published}
          hint={`${stats.drafts} still in draft`}
        />
        <StatCard
          label="Total students"
          value={stats.students}
          hint="Across all cohorts"
        />
        <StatCard
          label="Needs attention"
          value={stats.noCohort.length}
          hint={noCohortHint}
          tone={stats.noCohort.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line">
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
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-body"
                }`}
              >
                {t.label}
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-body">
                  {counts[t.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-2 flex items-center gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-input px-3 focus-within:border-accent">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="text-muted"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <span className="sr-only">Search courses</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
          </label>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {view === "table" ? (
        <CourseTable courses={visible} busyId={busyId} handlers={handlers} />
      ) : (
        <CourseGrid courses={visible} busyId={busyId} handlers={handlers} />
      )}

      <ConfirmDialog
        open={confirming !== null}
        title="Archive this course?"
        message={`“${confirming?.title ?? ""}” will be hidden from your course list and can’t be used for new cohorts. You can restore it at any time.`}
        confirmLabel="Archive"
        busy={confirming !== null && busyId === confirming.id}
        onConfirm={() => void confirmArchive()}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
