import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { useInstructorCourses } from "@/features/courses/hooks/useInstructorCourses";
import type { TaskKind } from "@/features/courses/types/outline";
import { builderPath, NEW_COURSE_PATH } from "@/features/courses/utils/paths";
import { TaskFilters } from "../components/TaskFilters";
import { TaskTable } from "../components/TaskTable";
import { groupTasks } from "../utils/groupTasks";

const parseType = (v: string | null): "" | TaskKind => (v === "code" || v === "quiz" ? v : "");
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Header() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-50">Tasks</h1>
      <p className="mt-1 text-sm text-gray-400">The exercises in a module, in the order students meet them.</p>
    </div>
  );
}

const emptyBox = "flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-800/30 px-6 py-14 text-center";

export default function AllTasksPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(""); // searching happens in the browser, so no waiting and no URL change per key
  const courses = useInstructorCourses();

  // Course: the one in the URL, otherwise the most recently edited one that isn't archived
  const courseParam = params.get("course");
  const defaultCourse = useMemo(
    () => courses.data?.find((c) => c.status !== "archived") ?? courses.data?.[0],
    [courses.data],
  );
  const courseId = courses.data?.find((c) => c.id === courseParam)?.id ?? defaultCourse?.id;

  const outline = useCourseOutline(courseId);
  const modules = useMemo(() => outline.data?.modules ?? [], [outline.data]);

  // Module: the one in the URL, "all", or the first
  const moduleParam = params.get("module");
  const moduleId: "all" | number =
    moduleParam === "all" ? "all" : (modules.find((m) => String(m.id) === moduleParam)?.id ?? modules[0]?.id ?? "all");
  const type = parseType(params.get("type"));

  function update(changes: Record<string, string | null>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true }, // changing a filter shouldn't fill the back button
    );
  }

  const groups = useMemo(
    () => (outline.data ? groupTasks(outline.data, { moduleId, type, q }) : []),
    [outline.data, moduleId, type, q],
  );

  if (courses.isPending) return <ListPageSkeleton label="Loading tasks" />;
  if (courses.isError) {
    return <ErrorState what="your courses" error={courses.error} onRetry={() => void courses.refetch()} />;
  }

  if (courses.data.length === 0 || !courseId) {
    return (
      <div className="space-y-6">
        <Header />
        <div className={emptyBox}>
          <h2 className="text-lg font-semibold text-gray-50">Create your first course</h2>
          <p className="max-w-md text-sm text-gray-400">Tasks belong to lessons, and lessons belong to courses.</p>
          <ButtonLink to={NEW_COURSE_PATH}>Create course</ButtonLink>
        </div>
      </div>
    );
  }

  const hasFilters = Boolean(type || q.trim());
  const shown = moduleId === "all" ? groups.filter((g) => g.rows.length > 0) : groups;
  const total = shown.reduce((sum, g) => sum + g.rows.length, 0);
  const scope = moduleId === "all" ? "this course" : `Module ${shown[0]?.moduleNumber ?? ""}`;

  function clear() {
    setQ("");
    update({ type: null });
  }

  return (
    <div className="space-y-6">
      <Header />

      <TaskFilters
        courses={courses.data.map((c) => ({ value: c.id, label: c.status === "archived" ? `${c.title} (archived)` : c.title }))}
        courseId={courseId}
        modules={modules.map((m, i) => ({ value: String(m.id), label: `Module ${i + 1}: ${m.title}` }))}
        moduleId={String(moduleId)}
        type={type}
        search={q}
        hasFilters={hasFilters}
        onCourse={(id) => update({ course: id, module: null })}
        onModule={(id) => update({ module: id })}
        onType={(t) => update({ type: t || null })}
        onSearch={setQ}
        onClear={clear}
      />

      {outline.isPending && (
        <p role="status" className="flex items-center gap-3 text-sm text-gray-400">
          <Spinner /> Loading tasks…
        </p>
      )}

      {outline.isError && (
        <ErrorState variant="section" what="the tasks" error={outline.error} onRetry={() => void outline.refetch()} />
      )}

      {outline.data && (
        <>
          <p aria-live="polite" className="text-sm text-gray-400">
            {plural(total, "task")} in {scope}
          </p>

          {modules.length === 0 ? (
            <div className={emptyBox}>
              <p className="font-semibold text-gray-50">This course has no modules yet</p>
              <ButtonLink to={builderPath(courseId)}>Open the builder</ButtonLink>
            </div>
          ) : total === 0 ? (
            hasFilters ? (
              <div className={emptyBox}>
                <p className="font-semibold text-gray-50">No tasks match your filters</p>
                <Button variant="ghost" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className={emptyBox}>
                <p className="font-semibold text-gray-50">No tasks here yet</p>
                <p className="max-w-md text-sm text-gray-400">Tasks belong to lessons. Open a lesson in the builder to add them.</p>
                <ButtonLink to={builderPath(courseId)}>Open the builder</ButtonLink>
              </div>
            )
          ) : (
            shown.map((g) => (
              <section key={g.moduleId} aria-labelledby={`module-heading-${g.moduleId}`} className="space-y-3">
                <h2 id={`module-heading-${g.moduleId}`} className="text-base font-semibold text-gray-100">
                  Module {g.moduleNumber}: {g.moduleTitle}
                  <span className="ml-2 text-sm font-normal text-gray-400">{plural(g.rows.length, "task")}</span>
                </h2>
                <TaskTable courseId={courseId} rows={g.rows} />
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}