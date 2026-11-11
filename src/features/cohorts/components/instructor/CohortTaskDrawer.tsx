import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormError } from "@/components/ui/FormError";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { ScheduleInputs } from "./ScheduleInputs";
import type { InstructorCohort } from "../../types/types";
import {
  localDateTime,
  scheduleError,
  schedulePayload,
  type CohortTask,
  type CohortTaskInput,
  type CohortTaskPatch,
  type ScheduleFields,
} from "../../types/cohortTask";

const emptySchedule: ScheduleFields = { start: "", due: "", xp: "10" };
interface SelectedTask {
  id: number;
  title: string;
  lesson: string;
  fields: ScheduleFields;
}

interface Props {
  cohort: InstructorCohort;
  assigned: CohortTask[];
  initialModuleId?: string;
  editing: CohortTask | null;
  onClose: () => void;
  onAssign: (tasks: CohortTaskInput[]) => Promise<void>;
  onUpdate: (id: number, patch: CohortTaskPatch) => Promise<void>;
}

export function CohortTaskDrawer({
  cohort,
  assigned,
  initialModuleId = "",
  editing,
  onClose,
  onAssign,
  onUpdate,
}: Props) {
  const outline = useCourseOutline(
    editing ? undefined : String(cohort.courseId),
  );
  const [moduleId, setModuleId] = useState(initialModuleId);
  const [lessonId, setLessonId] = useState("");
  const initialSchedule = editing
    ? {
      start: localDateTime(editing.start_date),
      due: localDateTime(editing.due_date),
      xp: String(editing.xp),
    }
    : emptySchedule;
  const [defaults, setDefaults] = useState<ScheduleFields>(initialSchedule);
  const [selected, setSelected] = useState<SelectedTask[]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const module = outline.data?.modules.find(
    (item) => String(item.id) === moduleId,
  );
  const lesson = module?.lessons.find((item) => String(item.id) === lessonId);
  const assignedIds = new Set(assigned.map((item) => item.task_id));

  function close() {
    if (running.current || confirmDiscard) return;
    setConfirmDiscard(true);
  }



  async function save() {
    if (running.current) return;
    const invalid = editing
      ? scheduleError(defaults)
      : !selected.length
        ? "Select at least one task."
        : selected
          .map((task) => {
            const issue = scheduleError(task.fields);
            return issue ? `${task.title}: ${issue}` : null;
          })
          .find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        const { xp, ...dates } = schedulePayload(defaults);
        await onUpdate(editing.id, {
          ...dates,
          ...(editing.can_edit_xp ? { xp } : {}),
        });
      } else
        await onAssign(
          selected.map((task) => ({
            task_id: task.id,
            ...schedulePayload(task.fields),
          })),
        );
      onClose();
    } catch (failure) {
      setError(
        failure instanceof ApiError && [409, 422].includes(failure.status ?? 0)
          ? failure.status === 409
            ? "A selected task was already assigned or can no longer be edited. Refresh the task list and try again."
            : "Check the dates, XP and selected tasks, then try again."
          : friendlyMessage(
            failure,
            "Couldn’t save cohort tasks. Please try again.",
          ),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  
  return (
    <Dialog open onClose={close} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/55 transition-opacity data-closed:opacity-0 motion-reduce:transition-none"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <DialogPanel
            data-learning-shell-overlay
            transition
            className="flex h-full w-screen max-w-2xl flex-col border-l border-line bg-surface text-body shadow-2xl transition-transform duration-300 data-closed:translate-x-full motion-reduce:transition-none"
          >
            <header className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {editing ? "Edit task schedule" : "Assign tasks"}
                </DialogTitle>
                <Description className="mt-1 text-xs leading-6 text-muted">
                  {cohort.name} · {cohort.course}
                </Description>
              </div>
              <button
                type="button"
                aria-label="Close task drawer"
                disabled={busy}
                onClick={close}
                className="rounded-lg p-2 hover:bg-hover"
              >
                <X size={18} />
              </button>
            </header>
            <form
              ref={formRef}
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
              className="min-h-0 flex-1 overflow-y-auto p-5"
            >
              <fieldset
                disabled={busy}
                className="space-y-6 disabled:opacity-70"
              >
                {editing ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {editing.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        {editing.lesson_title
                          ? `${editing.module_title ?? "Module"} → ${editing.lesson_title}`
                          : "Cohort-created task · Not attached to a lesson"}
                      </p>
                    </div>
                    <ScheduleInputs
                      prefix="edit-task"
                      fields={defaults}
                      onChange={setDefaults}
                      locked={!editing.can_edit_xp}
                    />
                    <p className="text-xs leading-6 text-muted">
                      This changes the cohort assignment, not the original task
                      content.
                    </p>
                  </>
                ) : (
                  <>
                    <section className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          1. Choose tasks from this course
                        </h3>
                        <button
                          type="button"
                          disabled={outline.isFetching}
                          onClick={() => void outline.refetch()}
                          className="text-xs font-semibold text-accent hover:underline disabled:opacity-50"
                        >
                          {outline.isFetching
                            ? "Refreshing…"
                            : "Refresh course outline"}
                        </button>
                      </div>
                      {outline.isPending ? (
                        <p role="status" className="text-sm text-muted">
                          Loading course outline…
                        </p>
                      ) : outline.error ? (
                        <ErrorState
                          what="the course outline"
                          error={outline.error}
                          onRetry={() => void outline.refetch()}
                          variant="section"
                        />
                      ) : (
                        <>
                          <div>
                            <label
                              htmlFor="assign-module"
                              className="mb-2 block text-xs text-muted"
                            >
                              Module
                            </label>
                            <Select
                              id="assign-module"
                              value={moduleId}
                              onChange={(value) => {
                                setModuleId(value);
                                setLessonId("");
                              }}
                              placeholder="Select a module"
                              options={[...(outline.data?.modules ?? [])]
                                .sort((a, b) => a.order - b.order)
                                .map((item) => ({
                                  value: String(item.id),
                                  label: item.title,
                                }))}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="assign-lesson"
                              className="mb-2 block text-xs text-muted"
                            >
                              Lesson
                            </label>
                            <Select
                              id="assign-lesson"
                              value={lessonId}
                              onChange={setLessonId}
                              disabled={!module || !module.lessons.length}
                              placeholder={
                                module && !module.lessons.length
                                  ? "No lessons in this module"
                                  : "Select a lesson"
                              }
                              options={[...(module?.lessons ?? [])]
                                .sort((a, b) => a.order - b.order)
                                .map((item) => ({
                                  value: String(item.id),
                                  label: item.title,
                                }))}
                            />
                          </div>
                          {module && !module.lessons.length && (
                            <p
                              role="status"
                              className="text-xs leading-6 text-muted"
                            >
                              No lessons were returned for this module. Refresh
                              the course outline if lessons were recently added,
                              or add lessons in the course builder.
                            </p>
                          )}
                          {lesson && (
                            <div className="divide-y divide-line rounded-lg border border-line">
                              {lesson.tasks.length ? (
                                [...lesson.tasks]
                                  .sort((a, b) => a.order - b.order)
                                  .map((task) => (
                                    <label
                                      key={task.id}
                                      className={`flex items-center gap-3 p-3 text-sm ${assignedIds.has(task.id) ? "text-muted" : "text-foreground"}`}
                                    >
                                      <input
                                        type="checkbox"
                                        disabled={assignedIds.has(task.id)}
                                        checked={selected.some(
                                          (item) => item.id === task.id,
                                        )}
                                        onChange={(event) =>
                                          setSelected((current) =>
                                            event.target.checked
                                              ? [
                                                ...current,
                                                {
                                                  id: task.id,
                                                  title: task.title,
                                                  lesson: lesson.title,
                                                  fields: { ...defaults },
                                                },
                                              ]
                                              : current.filter(
                                                (item) => item.id !== task.id,
                                              ),
                                          )
                                        }
                                        className="size-4 accent-accent"
                                      />
                                      <span className="min-w-0 flex-1">
                                        {task.title}
                                        <span className="mt-1 block text-xs text-muted">
                                          {task.type === "code"
                                            ? "Code task"
                                            : "Quiz"}
                                        </span>
                                      </span>
                                      {assignedIds.has(task.id) && (
                                        <span className="text-xs">
                                          Already assigned
                                        </span>
                                      )}
                                    </label>
                                  ))
                              ) : (
                                <p className="p-4 text-sm text-muted">
                                  This lesson has no tasks yet.
                                </p>
                              )}
                            </div>
                          )}
                          {outline.data?.modules.length === 0 && (
                            <p className="text-sm text-muted">
                              Add modules, lessons and tasks in the course
                              builder first.
                            </p>
                          )}
                        </>
                      )}
                    </section>
                    <section className="space-y-3 rounded-xl border border-line bg-input p-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        2. Set shared defaults
                      </h3>
                      <p className="text-xs leading-6 text-muted">
                        Defaults apply when you select a task. You can adjust
                        each task below.
                      </p>
                      <ScheduleInputs
                        prefix="default-task"
                        fields={defaults}
                        onChange={setDefaults}
                      />
                      {selected.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelected((current) =>
                              current.map((task) => ({
                                ...task,
                                fields: { ...defaults },
                              })),
                            )
                          }
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          Apply defaults to all selected tasks
                        </button>
                      )}
                    </section>
                    {selected.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">
                          3. Review {selected.length} selected{" "}
                          {selected.length === 1 ? "task" : "tasks"}
                        </h3>
                        {selected.map((task) => (
                          <div
                            key={task.id}
                            className="space-y-4 rounded-xl border border-line p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {task.title}
                                </h4>
                                <p className="mt-1 text-xs text-muted">
                                  {task.lesson}
                                </p>
                              </div>
                              <button
                                type="button"
                                aria-label={`Remove ${task.title}`}
                                onClick={() =>
                                  setSelected((current) =>
                                    current.filter(
                                      (item) => item.id !== task.id,
                                    ),
                                  )
                                }
                                className="rounded p-1 text-muted hover:text-danger"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <ScheduleInputs
                              prefix={`task-${task.id}`}
                              fields={task.fields}
                              onChange={(fields) =>
                                setSelected((current) =>
                                  current.map((item) =>
                                    item.id === task.id
                                      ? { ...item, fields }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                        ))}
                      </section>
                    )}
                  </>
                )}
                {error && <FormError message={error} />}
              </fieldset>
            </form>
            <footer className="flex items-center justify-between gap-4 border-t border-line p-5">
              <span className="text-xs text-muted">
                {editing
                  ? "Times use your browser’s timezone."
                  : `${selected.length} selected · Times use your browser’s timezone.`}
              </span>
              <Button
                disabled={busy || (!editing && !selected.length)}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Assign tasks"}
              </Button>
            </footer>
            <ConfirmDialog
              open={confirmDiscard}
              title="Discard task changes?"
              message="Your unsaved selections and schedule changes will be lost."
              confirmLabel="Discard changes"
              onConfirm={onClose}
              onCancel={() => setConfirmDiscard(false)}
            />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
