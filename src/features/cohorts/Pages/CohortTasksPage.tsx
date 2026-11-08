import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { SearchBar } from "@/components/ui/SearchBar";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { CohortTaskTable } from "../components/instructor/CohortTaskTable";
import {
  ActionNotice,
  type Notice,
} from "@/features/courses/components/instructor/ActionNotice";
import { useInstructorCohorts } from "../hooks/useCohorts";
import {
  CohortTaskService,
  cohortTaskKey,
} from "../Services/cohortTaskService";
import { CohortTaskDrawer } from "../components/instructor/CohortTaskDrawer";
import { cohortTaskStatus, type CohortTask } from "../types/cohortTask";
import type { InstructorCohort } from "../types/types";

export default function CohortTasksPage() {
  const cohorts = useInstructorCohorts();
  const [params, setParams] = useSearchParams();
  if (cohorts.isPending)
    return <ListPageSkeleton label="Loading your cohorts" />;
  if (cohorts.error)
    return (
      <ErrorState
        what="your cohorts"
        error={cohorts.error}
        onRetry={() => void cohorts.refetch()}
      />
    );
  const cohort =
    cohorts.data.find((item) => item.id === params.get("cohort")) ??
    (!params.has("cohort") ? cohorts.data[0] : undefined);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-accent">Cohorts / Manage tasks</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Manage cohort tasks
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choose course tasks and decide when your cohort can work on them.
        </p>
      </header>
      {!cohorts.data.length ? (
        <div className="space-y-4 rounded-xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">
            Create a cohort before assigning tasks.
          </p>
          <ButtonLink to="/instructor/cohorts/new">Create cohort</ButtonLink>
        </div>
      ) : (
        <>
          <div className="max-w-md">
            <label
              htmlFor="tasks-cohort"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Cohort
            </label>
            <Select
              id="tasks-cohort"
              searchable
              value={cohort?.id ?? ""}
              onChange={(id) => setParams({ cohort: id })}
              placeholder="Select a cohort"
              options={cohorts.data.map((item) => ({
                value: item.id,
                label: item.name,
                description: item.course,
              }))}
            />
          </div>
          {cohort ? (
            <TaskList key={cohort.id} cohort={cohort} />
          ) : (
            <p className="text-sm text-muted">
              Choose one of your cohorts to continue.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TaskList({ cohort }: { cohort: InstructorCohort }) {
  const query = useQuery({
    queryKey: cohortTaskKey(cohort.id),
    queryFn: () => CohortTaskService.list(cohort.id),
  });
  const client = useQueryClient();
  const outline = useCourseOutline(String(cohort.courseId));
  const [params, setParams] = useSearchParams();
  const modules = [...(outline.data?.modules ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const moduleParam = params.get("module");
  const moduleId = modules.some((module) => String(module.id) === moduleParam)
    ? moduleParam!
    : "all";
  const type =
    params.get("type") === "code" || params.get("type") === "quiz"
      ? params.get("type")!
      : "";
  function updateFilters(changes: Record<string, string>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }
  const [removing, setRemoving] = useState<CohortTask | null>(null);
  const [removingBusy, setRemovingBusy] = useState(false);
  const removalRunning = useRef(false);
  const [drawer, setDrawer] = useState<"assign" | CohortTask | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const rows = query.data ?? [];
  const moduleTaskIds = new Map(
    modules.map((module) => [
      module.id,
      new Set(
        module.lessons.flatMap((lesson) => lesson.tasks.map((task) => task.id)),
      ),
    ]),
  );
  const visible = rows
    .filter(
      (task) =>
        (moduleId === "all" ||
          moduleTaskIds.get(Number(moduleId))?.has(task.task_id)) &&
        (!type || task.type === type) &&
        (status === "all" || cohortTaskStatus(task, now) === status) &&
        `${task.title} ${task.module_title} ${task.lesson_title}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );
  const groups = modules
    .filter((module) => moduleId === "all" || String(module.id) === moduleId)
    .map((module) => ({
      id: String(module.id),
      title: `Module ${modules.findIndex((item) => item.id === module.id) + 1}: ${module.title}`,
      rows: visible.filter((task) =>
        moduleTaskIds.get(module.id)?.has(task.task_id),
      ),
    }));
  const knownTaskIds = new Set(
    modules.flatMap((module) => [...(moduleTaskIds.get(module.id) ?? [])]),
  );
  const otherRows =
    moduleId === "all"
      ? visible.filter((task) => !knownTaskIds.has(task.task_id))
      : [];
  if (otherRows.length)
    groups.push({
      id: "other",
      title: "Other assigned tasks",
      rows: otherRows,
    });
  const hasFilters = !!(type || search.trim() || status !== "all");
  const loadFailure = query.error ? query : outline.error ? outline : null;
  async function removeAssignment() {
    if (!removing || removalRunning.current) return;
    const task = removing;
    removalRunning.current = true;
    setRemovingBusy(true);
    setNotice(null);
    try {
      await CohortTaskService.remove(task.id);
      client.setQueryData<CohortTask[]>(cohortTaskKey(cohort.id), (current) =>
        current?.filter((item) => item.id !== task.id),
      );
      await client.invalidateQueries({ queryKey: cohortTaskKey(cohort.id) });
      setNotice({
        kind: "success",
        message: `“${task.title}” was removed from this cohort. The original task is unchanged.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof ApiError && error.status === 409
            ? error.message
            : friendlyMessage(
                error,
                "Couldn’t remove this task from the cohort. Please try again.",
              ),
      });
    } finally {
      removalRunning.current = false;
      setRemovingBusy(false);
      setRemoving(null);
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {cohort.name}
          </h2>
          <p className="mt-1 text-xs text-muted">{cohort.course}</p>
        </div>
        <Button
          disabled={query.isPending || outline.isPending || !!loadFailure}
          onClick={() => setDrawer("assign")}
        >
          <Plus size={16} />
          Assign tasks
        </Button>
      </div>
      <ActionNotice notice={notice} onDismiss={dismiss} />
      {loadFailure ? (
        <ErrorState
          what="cohort tasks and course modules"
          error={loadFailure.error}
          onRetry={() => void loadFailure.refetch()}
        />
      ) : query.isPending || outline.isPending ? (
        <ListPageSkeleton label="Loading cohort tasks and modules" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_180px]">
            <div>
              <label
                htmlFor="cohort-task-module"
                className="mb-2 block text-xs font-semibold text-muted"
              >
                Module
              </label>
              <Select
                id="cohort-task-module"
                value={moduleId}
                onChange={(value) => updateFilters({ module: value })}
                searchable
                placeholder="Choose a module"
                options={[
                  { value: "all", label: "All modules in this course" },
                  ...modules.map((module, index) => ({
                    value: String(module.id),
                    label: `Module ${index + 1}: ${module.title}`,
                    description: `${rows.filter((task) => moduleTaskIds.get(module.id)?.has(task.task_id)).length} assigned tasks`,
                  })),
                ]}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted">
                Search in this view
              </p>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search tasks, modules or lessons"
              />
            </div>
            <div>
              <label
                htmlFor="cohort-task-status"
                className="mb-2 block text-xs font-semibold text-muted"
              >
                Status
              </label>
              <Select
                id="cohort-task-status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  ...["Scheduled", "Open", "Expired"].map((value) => ({
                    value,
                    label: value,
                  })),
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line">
            <div className="flex">
              {[
                { value: "", label: "All" },
                { value: "code", label: "Code" },
                { value: "quiz", label: "Quiz" },
              ].map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={type === tab.value}
                  onClick={() => updateFilters({ type: tab.value })}
                  className={`inline-flex min-h-11 items-center border-b-2 px-3.5 text-sm font-semibold transition-colors ${type === tab.value ? "border-accent text-accent" : "border-transparent text-muted hover:text-body"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  updateFilters({ type: "" });
                }}
                className="min-h-11 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-hover"
              >
                Clear filters
              </button>
            )}
          </div>
          <p aria-live="polite" className="text-sm text-muted">
            {visible.length} assigned {visible.length === 1 ? "task" : "tasks"}{" "}
            in {moduleId === "all" ? "this course" : "this module"}
          </p>
          {visible.length ? (
            groups
              .filter((group) => group.rows.length > 0)
              .map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`cohort-module-${group.id}`}
                  className="space-y-3"
                >
                  <h3
                    id={`cohort-module-${group.id}`}
                    className="text-base font-semibold text-foreground"
                  >
                    {group.title}
                    <span className="ml-2 text-sm font-normal text-muted">
                      {group.rows.length}{" "}
                      {group.rows.length === 1 ? "task" : "tasks"}
                    </span>
                  </h3>
                  <CohortTaskTable
                    rows={group.rows}
                    courseId={cohort.courseId}
                    now={now}
                    onEdit={setDrawer}
                    busy={removingBusy}
                    onRemove={(task) => {
                      setNotice(null);
                      setRemoving(task);
                    }}
                  />
                </section>
              ))
          ) : (
            <div className="rounded-xl border border-dashed border-line py-12 text-center">
              <CalendarClock className="mx-auto text-muted" size={28} />
              <h3 className="mt-4 font-semibold text-foreground">
                {hasFilters
                  ? "No matching tasks"
                  : moduleId !== "all"
                    ? "No tasks assigned in this module"
                    : "No tasks assigned yet"}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {hasFilters
                  ? "Try another search, type or status."
                  : "Choose tasks from a module and lesson to get started."}
              </p>
            </div>
          )}
          <p className="text-xs leading-6 text-muted">
            Times are shown in your browser’s timezone. Expired tasks remain
            available for practice.{" "}
            <Link
              to={`/instructor/courses/${cohort.courseId}/builder`}
              className="text-accent hover:underline"
            >
              Open course builder →
            </Link>
          </p>
        </>
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Remove task from cohort?"
        message={`Remove “${removing?.title ?? ""}” from ${cohort.name}? Students will no longer see this assigned task. The original course task will be kept.`}
        confirmLabel="Remove from cohort"
        busy={removingBusy}
        onConfirm={() => void removeAssignment()}
        onCancel={() => setRemoving(null)}
      />
      {drawer && (
        <CohortTaskDrawer
          cohort={cohort}
          assigned={rows}
          initialModuleId={moduleId === "all" ? "" : moduleId}
          editing={drawer === "assign" ? null : drawer}
          onClose={() => setDrawer(null)}
          onAssign={async (tasks) => {
            await CohortTaskService.assign(cohort.id, tasks);
            await client.invalidateQueries({
              queryKey: cohortTaskKey(cohort.id),
            });
            setNotice({
              kind: "success",
              message: `${tasks.length} ${tasks.length === 1 ? "task assigned" : "tasks assigned"} to ${cohort.name}.`,
            });
          }}
          onUpdate={async (id, patch) => {
            await CohortTaskService.update(id, patch);
            await client.invalidateQueries({
              queryKey: cohortTaskKey(cohort.id),
            });
            setNotice({ kind: "success", message: "Task schedule updated." });
          }}
        />
      )}
    </div>
  );
}
