import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ClipboardList,
  Code2,
  EyeOff,
  HelpCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { TaskService } from "@/features/tasks/services/taskService";
import {
  CohortTaskService,
  cohortTaskKey,
} from "@/features/cohorts/Services/cohortTaskService";
import type { CohortTask } from "@/features/cohorts/types/cohortTask";
import { friendlyMessage } from "@/lib/apiError";
import type { LiveRoom } from "../hooks/useLiveRoom";
import {
  InstructorSessionService,
  sessionKeys,
} from "../services/instructorSessionService";
import type { LiveTaskState } from "../services/liveRoomService";

export function LiveTaskPickerButton({
  room,
  sessionId,
}: {
  room: LiveRoom;
  sessionId: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => InstructorSessionService.get(sessionId),
    enabled: open,
    staleTime: 60_000,
  });

  const cohortId = sessionQuery.data?.cohort_id
    ? String(sessionQuery.data.cohort_id)
    : "";

  const tasksQuery = useQuery({
    queryKey: cohortTaskKey(cohortId),
    queryFn: () => CohortTaskService.list(cohortId),
    enabled: open && Boolean(cohortId),
    staleTime: 30_000,
  });

  const filteredTasks = useMemo(() => {
    const list = tasksQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.module_title ?? "").toLowerCase().includes(q) ||
        (t.lesson_title ?? "").toLowerCase().includes(q),
    );
  }, [tasksQuery.data, search]);

  const isTaskOpen = Boolean(room.liveTask?.open);

  const selectTask = async (task: CohortTask) => {
    setPickError(null);
    setLoadingTaskId(task.id);
    try {
      const detail = await TaskService.get(String(task.task_id));
      if (room.reeborg.open) {
        room.sendReeborg({ ...room.reeborg, open: false });
      }
      room.sendTask({
        open: true,
        task_id: task.id,
        title: detail.title,
        type: detail.type,
        instructions: detail.instructions,
        questions:
          detail.type === "quiz"
            ? detail.questions.map((q) => ({
                id: q.id,
                prompt: q.prompt,
                choices: q.choices,
              }))
            : undefined,
      });
      setOpen(false);
    } catch (err) {
      setPickError(
        friendlyMessage(err, "Couldn't load the selected task. Try again."),
      );
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-pressed={isTaskOpen}
        aria-label="Select task for correction"
        className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:px-4 ${
          isTaskOpen
            ? "border-accent/60 bg-accent/15 text-accent"
            : "border-line text-body hover:bg-hover"
        }`}
      >
        <ClipboardList size={18} aria-hidden />
        <span className="hidden md:inline">
          {isTaskOpen ? "Change task" : "Task"}
        </span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="flex max-h-[82dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Select a task for correction
                </DialogTitle>
                <p className="mt-0.5 text-xs text-muted">
                  The question will be displayed to everyone in the live room.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close task picker"
                className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-foreground"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="border-b border-line px-5 py-3">
              <div className="relative">
                <Search
                  size={15}
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cohort tasks…"
                  aria-label="Search cohort tasks"
                  className="h-9 w-full rounded-lg border border-line bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
                />
              </div>
              {pickError && (
                <p role="alert" className="mt-2 text-xs text-danger">
                  {pickError}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {sessionQuery.isPending || tasksQuery.isPending ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  <span>Loading cohort tasks…</span>
                </div>
              ) : sessionQuery.error || tasksQuery.error ? (
                <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-xs text-danger">
                  {friendlyMessage(
                    sessionQuery.error ?? tasksQuery.error,
                    "Failed to load cohort tasks.",
                  )}
                </div>
              ) : filteredTasks.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  {search.trim()
                    ? "No matching tasks found."
                    : "No tasks assigned to this cohort yet."}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {filteredTasks.map((task) => {
                    const isSelected =
                      isTaskOpen && room.liveTask?.task_id === task.id;
                    const isBusy = loadingTaskId === task.id;

                    return (
                      <li key={task.id}>
                        <button
                          type="button"
                          disabled={loadingTaskId !== null}
                          onClick={() => void selectTask(task)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:opacity-60 ${
                            isSelected
                              ? "border-accent bg-accent/10"
                              : "border-line bg-canvas/50 hover:border-accent/50 hover:bg-hover"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {task.type === "code" ? (
                              <Code2
                                size={17}
                                className="shrink-0 text-accent"
                                aria-hidden
                              />
                            ) : (
                              <HelpCircle
                                size={17}
                                className="shrink-0 text-warning"
                                aria-hidden
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {task.title}
                              </p>
                              {(task.module_title || task.lesson_title) && (
                                <p className="truncate text-xs text-muted">
                                  {[task.module_title, task.lesson_title]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                              {task.type}
                            </span>
                            {isBusy && (
                              <Loader2
                                size={14}
                                className="animate-spin text-accent"
                                aria-hidden
                              />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {isTaskOpen && (
              <div className="flex items-center justify-between border-t border-line bg-canvas/60 px-5 py-3">
                <span className="truncate text-xs text-muted">
                  Showing: <strong className="text-foreground">{room.liveTask?.title}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    room.sendTask(null);
                    setOpen(false);
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-body hover:bg-hover hover:text-foreground"
                >
                  <EyeOff size={14} aria-hidden />
                  Hide task
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export function LiveTaskQuestionPanel({
  task,
  canClose,
  onClose,
}: {
  task: LiveTaskState;
  canClose: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-accent">
          {task.type === "code" ? (
            <Code2 size={12} aria-hidden />
          ) : (
            <HelpCircle size={12} aria-hidden />
          )}
          {task.type} correction
        </span>
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-muted hover:bg-hover hover:text-foreground"
          >
            <EyeOff size={12} aria-hidden />
            Hide
          </button>
        )}
      </div>

      {task.instructions?.trim() && (
        <MarkdownRenderer content={task.instructions} />
      )}

      {task.type === "quiz" && task.questions && task.questions.length > 0 && (
        <ol className="space-y-4 border-t border-line pt-4">
          {task.questions.map((q, index) => (
            <li
              key={q.id}
              className="rounded-xl border border-line bg-surface p-3.5 space-y-2.5"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Question {index + 1}
              </p>
              <MarkdownRenderer content={q.prompt} />
              <ul className="space-y-1.5 pt-1">
                {q.choices.map((c, cIndex) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs text-body"
                  >
                    <span className="font-mono font-semibold text-muted">
                      {String.fromCharCode(65 + cIndex)}.
                    </span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
