import "@/features/theme/learning-shell.css";
import "@/layouts/StudentLayout/student-theme.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCode2,
  HelpCircle,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { Spinner } from "@/components/ui/Spinner";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { friendlyMessage } from "@/lib/apiError";
import { CurriculumSidebar } from "../components/CurriculumSidebar";
import { EmbeddedTaskView } from "../components/EmbeddedTaskView";
import { UnlockCelebration } from "../components/UnlockCelebration";
import { isTaskDone, useLearningPath } from "../hooks/useLearningPath";
import { useStudentLesson } from "../hooks/useStudentLesson";

function LessonPlayerShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div
        data-student-shell
        className="flex h-dvh w-full flex-col overflow-hidden bg-canvas text-body"
      >
        {children}
      </div>
    </ThemeProvider>
  );
}

function LessonPlayerSkeleton() {
  return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="h-14 shrink-0 border-b border-line bg-surface" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 border-r border-line bg-surface lg:block" />
        <div className="flex-1 p-8">
          <div className="mx-auto h-96 max-w-4xl rounded-xl border border-line bg-surface" />
        </div>
      </div>
    </div>
  );
}

export function LessonPlayerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetId = Number(lessonId);
  const taskParam = searchParams.get("task");
  const requestedTaskId = taskParam ? Number(taskParam) : null;

  const {
    cohortId,
    course,
    isLoading: courseLoading,
    error: courseError,
    refetch: refetchCourse,
    breakdown,
  } = useLearningPath();

  const flattenedLessons =
    course?.modules.flatMap((mod) =>
      mod.lessons.map((lesson) => ({ mod, lesson })),
    ) ?? [];
  const currentIndex = flattenedLessons.findIndex(
    (entry) => entry.lesson.id === targetId,
  );
  const current =
    currentIndex >= 0 ? flattenedLessons[currentIndex] : flattenedLessons[0];

  const activeLessonId = current?.lesson.id ?? (Number.isFinite(targetId) ? targetId : null);
  const lessonQuery = useStudentLesson(cohortId, activeLessonId);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);
  const [celebration, setCelebration] = useState<{
    title: string;
    path: string;
  } | null>(null);
  const prevUnlockedRef = useRef<{
    cohortId: number | null;
    lessons: Set<number>;
    tasks: Set<number>;
  } | null>(null);

  useEffect(() => {
    if (!course) return;
    const unlockedLessons = new Set<number>();
    const unlockedTasks = new Set<number>();
    let newlyUnlocked: { title: string; path: string } | null = null;

    const prev = prevUnlockedRef.current;
    const isSameCohort = prev !== null && prev.cohortId === cohortId;

    for (const mod of course.modules) {
      for (const l of mod.lessons) {
        if (!l.is_locked) {
          unlockedLessons.add(l.id);
          if (isSameCohort && !prev.lessons.has(l.id) && !newlyUnlocked) {
            newlyUnlocked = {
              title: `Unlocked: ${l.title}`,
              path: `/lessons/${l.id}`,
            };
          }
        }
        for (const t of l.tasks) {
          if (!t.is_locked) {
            unlockedTasks.add(t.id);
            if (isSameCohort && !prev.tasks.has(t.id) && !newlyUnlocked) {
              newlyUnlocked = {
                title: `Unlocked: ${t.title}`,
                path: `/lessons/${l.id}?task=${t.id}`,
              };
            }
          }
        }
      }
    }

    prevUnlockedRef.current = {
      cohortId,
      lessons: unlockedLessons,
      tasks: unlockedTasks,
    };

    if (newlyUnlocked) {
      setCelebration(newlyUnlocked);
    }
  }, [course, cohortId]);

  if (courseLoading) {
    return (
      <LessonPlayerShell>
        <LessonPlayerSkeleton />
      </LessonPlayerShell>
    );
  }

  if (courseError) {
    return (
      <LessonPlayerShell>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <ErrorState
              what="this lesson"
              error={courseError}
              onRetry={() => void refetchCourse()}
              homeTo="/lessons"
              homeLabel="Back to learning path"
            />
          </div>
        </div>
      </LessonPlayerShell>
    );
  }

  if (!course || !current) {
    return (
      <LessonPlayerShell>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {!course ? "No active course found" : "Lesson not found"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Select a cohort and open a lesson from your Learning Path.
            </p>
            <Link
              to="/lessons"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ea043]"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to Learning Path
            </Link>
          </div>
        </div>
      </LessonPlayerShell>
    );
  }

  const { mod, lesson } = current;
  const lessonDetail = lessonQuery.data ?? null;
  const tasks = lessonDetail?.tasks ?? [];

  const activeTask =
    requestedTaskId !== null
      ? (tasks.find((task) => task.id === requestedTaskId) ?? null)
      : null;

  const prevEntry = currentIndex > 0 ? flattenedLessons[currentIndex - 1] : null;
  const nextEntry =
    currentIndex >= 0 && currentIndex < flattenedLessons.length - 1
      ? flattenedLessons[currentIndex + 1]
      : null;

  const firstUnlockedTask =
    tasks.find((task) => !task.is_locked && !isTaskDone(task.status)) ??
    tasks.find((task) => !task.is_locked);

  const nextActionPath = firstUnlockedTask
    ? `/lessons/${lesson.id}?task=${firstUnlockedTask.id}`
    : nextEntry && !nextEntry.lesson.is_locked
      ? `/lessons/${nextEntry.lesson.id}`
      : null;

  const nextActionLabel = firstUnlockedTask
    ? firstUnlockedTask.type === "quiz"
      ? `Start Quiz: ${firstUnlockedTask.title}`
      : `Open Task: ${firstUnlockedTask.title}`
    : nextEntry && !nextEntry.lesson.is_locked
      ? `Next Lesson: ${nextEntry.lesson.title}`
      : null;

  const activeTaskIndex = activeTask
    ? tasks.findIndex((task) => task.id === activeTask.id)
    : -1;
  const nextTaskInLesson =
    activeTaskIndex >= 0 && activeTaskIndex < tasks.length - 1
      ? tasks[activeTaskIndex + 1]
      : null;

  const nextStepAfterActiveTask =
    nextTaskInLesson && !nextTaskInLesson.is_locked
      ? {
          path: `/lessons/${lesson.id}?task=${nextTaskInLesson.id}`,
          label: `Next: ${nextTaskInLesson.title}`,
        }
      : nextEntry && !nextEntry.lesson.is_locked
        ? {
            path: `/lessons/${nextEntry.lesson.id}`,
            label: `Next Lesson: ${nextEntry.lesson.title}`,
          }
        : null;

  return (
    <LessonPlayerShell>
      {/* ── Full-Width Top Player Header ───────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3 sm:h-14 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to="/lessons"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-body transition-colors hover:bg-hover hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Learning Path</span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="hidden rounded-lg border border-line bg-canvas p-1.5 text-muted transition-colors hover:bg-hover hover:text-foreground lg:inline-flex"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" aria-hidden />
            ) : (
              <PanelLeftOpen className="size-4" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileCurriculumOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-body lg:hidden"
          >
            <PanelLeftOpen className="size-3.5" aria-hidden />
            Curriculum
          </button>

          <div className="hidden min-w-0 items-center gap-1.5 pl-1 text-xs text-muted md:flex">
            <span className="truncate">{mod.title}</span>
            <span>/</span>
            <span className="truncate font-medium text-body">
              {lessonDetail?.title ?? lesson.title}
            </span>
            {activeTask && (
              <>
                <span>/</span>
                <span className="truncate font-semibold text-foreground">
                  {activeTask.title}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-xs text-muted sm:inline-block">
            {breakdown.completedSteps}/{breakdown.totalSteps} steps
          </span>

          {prevEntry && !prevEntry.lesson.is_locked && (
            <Link
              to={`/lessons/${prevEntry.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-body transition-colors hover:bg-hover hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Prev
            </Link>
          )}

          {nextEntry && !nextEntry.lesson.is_locked && (
            <Link
              to={`/lessons/${nextEntry.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-hover"
            >
              Next
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}

          <ThemeToggle />
        </div>
      </header>

      {/* ── Full-Height Body: Docked Left Sidebar + Main Course Pane ───────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Docked Full-Height Sidebar */}
        {sidebarOpen && (
          <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-line bg-surface lg:flex">
            <div className="shrink-0 border-b border-line px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Curriculum
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {course.title}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CurriculumSidebar
                course={course}
                activeLessonId={lesson.id}
                activeTaskId={activeTask?.id ?? null}
              />
            </div>
          </aside>
        )}

        {/* Mobile Slide-over Curriculum Drawer */}
        {mobileCurriculumOpen && (
          <div
            className="fixed inset-0 z-50 flex bg-black/60 lg:hidden"
            onClick={() => setMobileCurriculumOpen(false)}
          >
            <aside
              className="flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    Curriculum
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {course.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileCurriculumOpen(false)}
                  aria-label="Close curriculum"
                  className="rounded-lg p-1 text-muted hover:bg-hover hover:text-foreground"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CurriculumSidebar
                  course={course}
                  activeLessonId={lesson.id}
                  activeTaskId={activeTask?.id ?? null}
                  onSelectItem={() => setMobileCurriculumOpen(false)}
                />
              </div>
            </aside>
          </div>
        )}

        {/* Right Main Content Column (Step Bar + Active Lesson / Quiz / Code Task) */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
          {/* Pinned Step Sequence Bar (single-row horizontal scroll on mobile) */}
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto border-b border-line bg-surface/60 px-3 py-2 [scrollbar-width:none] sm:gap-2 sm:px-4 sm:py-2.5 [&::-webkit-scrollbar]:hidden">
            <Link
              to={`/lessons/${lesson.id}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${
                activeTask === null
                  ? "border-accent/40 bg-accent/15 font-semibold text-accent"
                  : "border-line bg-canvas text-body hover:border-accent/50 hover:text-foreground"
              }`}
            >
              <BookOpen className="size-3.5 shrink-0" aria-hidden />
              Lesson Notes
            </Link>

            {(lessonDetail ? tasks : lesson.tasks).map((task) => {
              const done = isTaskDone(task.status);
              const isSelected = activeTask?.id === task.id;
              const taskPath = `/lessons/${lesson.id}?task=${task.id}`;

              return (
                <div key={task.id} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <ArrowRight className="size-3 shrink-0 text-muted sm:size-3.5" aria-hidden />
                  {task.is_locked ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs text-muted opacity-65 sm:px-3 sm:py-1.5">
                      <Lock className="size-3 shrink-0" aria-hidden />
                      {task.title}
                    </span>
                  ) : (
                    <Link
                      to={taskPath}
                      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${
                        isSelected
                          ? "border-accent/40 bg-accent/15 font-semibold text-accent"
                          : done
                            ? "border-emerald-500/30 bg-emerald-500/10 text-success hover:bg-emerald-500/15"
                            : "border-line bg-canvas text-body hover:border-accent/50 hover:text-foreground"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                      ) : task.type === "code" ? (
                        <FileCode2
                          className="size-3.5 shrink-0 text-accent"
                          aria-hidden
                        />
                      ) : (
                        <HelpCircle
                          className="size-3.5 shrink-0 text-warning"
                          aria-hidden
                        />
                      )}
                      <span>{task.title}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {lessonQuery.isPending ? (
            <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted">
              <Spinner />
              <span>Loading lesson…</span>
            </div>
          ) : lessonQuery.error ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center">
                <Lock className="mx-auto size-6 text-warning" aria-hidden />
                <h2 className="mt-3 text-base font-semibold text-foreground">
                  Lesson unavailable
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  {friendlyMessage(
                    lessonQuery.error,
                    "Unable to load this lesson right now.",
                  )}
                </p>
                <div className="mt-5 flex justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void lessonQuery.refetch()}
                    className="rounded-lg border border-line bg-canvas px-3.5 py-2 text-xs font-medium text-foreground hover:bg-hover"
                  >
                    Retry
                  </button>
                  <Link
                    to="/lessons"
                    className="rounded-lg bg-[#238636] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2ea043]"
                  >
                    Back to Learning Path
                  </Link>
                </div>
              </div>
            </div>
          ) : activeTask && cohortId ? (
            <EmbeddedTaskView
              cohortId={cohortId}
              task={activeTask}
              nextStep={nextStepAfterActiveTask}
              onBackToLesson={() => navigate(`/lessons/${lesson.id}`)}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-[1320px] gap-10 px-6 py-7 sm:px-10 lg:px-12">
                {/* Main Unboxed Lesson Article */}
                <div className="min-w-0 flex-1">
                  <article className="space-y-6">
                    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-accent">
                          {mod.title}
                        </p>
                        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                          {lessonDetail?.title ?? lesson.title}
                        </h1>
                      </div>

                      {(lessonDetail?.is_completed ?? lesson.is_completed) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-success">
                          <CheckCircle2 className="size-3.5" aria-hidden />
                          Completed
                        </span>
                      )}
                    </header>

                    <div className="pt-1">
                      {lessonDetail?.content?.trim() ? (
                        <MarkdownRenderer content={lessonDetail.content} />
                      ) : (
                        <p className="text-sm text-muted">
                          No written notes have been added to this lesson yet.
                        </p>
                      )}
                    </div>
                  </article>

                  {nextActionPath && nextActionLabel && (
                    <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                          Ready for the next step?
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                          {nextActionLabel}
                        </p>
                      </div>

                      <Link
                        to={nextActionPath}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
                      >
                        <span>
                          {firstUnlockedTask?.type === "quiz"
                            ? "Start Quiz"
                            : firstUnlockedTask
                              ? "Open Task"
                              : "Next Lesson"}
                        </span>
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </section>
                  )}
                </div>

                {/* Right Practice & Lesson Steps Rail (xl+) */}
                <aside className="hidden w-72 shrink-0 space-y-4 xl:block">
                  <div className="sticky top-6 space-y-4">
                    <div className="rounded-xl border border-line bg-surface p-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                        In This Lesson
                      </p>
                      {tasks.length === 0 ? (
                        <p className="mt-2.5 text-xs text-muted">
                          No practice tasks attached to this lesson.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {tasks.map((task) => {
                            const done = isTaskDone(task.status);
                            const taskPath = `/lessons/${lesson.id}?task=${task.id}`;
                            if (task.is_locked) {
                              return (
                                <li
                                  key={task.id}
                                  className="flex items-center gap-2.5 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs text-muted opacity-65"
                                >
                                  <Lock className="size-3.5 shrink-0" aria-hidden />
                                  <span className="truncate">{task.title}</span>
                                </li>
                              );
                            }
                            return (
                              <li key={task.id}>
                                <Link
                                  to={taskPath}
                                  className="flex items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-hover"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    {done ? (
                                      <CheckCircle2
                                        className="size-3.5 shrink-0 text-success"
                                        aria-hidden
                                      />
                                    ) : task.type === "code" ? (
                                      <FileCode2
                                        className="size-3.5 shrink-0 text-accent"
                                        aria-hidden
                                      />
                                    ) : (
                                      <HelpCircle
                                        className="size-3.5 shrink-0 text-warning"
                                        aria-hidden
                                      />
                                    )}
                                    <span className="truncate">{task.title}</span>
                                  </span>
                                  <span className="shrink-0 font-mono text-[10px] uppercase text-muted">
                                    {task.type}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>
      {celebration && (
        <UnlockCelebration
          title={celebration.title}
          actionPath={celebration.path}
          actionLabel="Start"
          onDismiss={() => setCelebration(null)}
        />
      )}
    </LessonPlayerShell>
  );
}
