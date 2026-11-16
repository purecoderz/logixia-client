import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  FileCode2,
  HelpCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { isTaskDone, useLearningPath } from "../hooks/useLearningPath";
import type { LearningPathModule } from "../types";

function LearningPathSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
      <div className="h-36 rounded-2xl border border-line bg-surface" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-20 rounded-xl border border-line bg-surface" />
          <div className="h-64 rounded-xl border border-line bg-surface" />
          <div className="h-20 rounded-xl border border-line bg-surface" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl border border-line bg-surface" />
          <div className="h-48 rounded-xl border border-line bg-surface" />
        </div>
      </div>
    </div>
  );
}

function getModulePercent(mod: LearningPathModule): number {
  if (mod.total_lessons <= 0) return mod.is_completed ? 100 : 0;
  return Math.round((mod.completed_lessons / mod.total_lessons) * 100);
}

function formatTaskStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "submitted":
      return "Submitted";
    case "in_progress":
      return "In progress";
    default:
      return "Not started";
  }
}

export function LearningPathPage() {
  const navigate = useNavigate();
  const {
    activeCohort,
    cohortId,
    course,
    isLoading,
    error,
    refetch,
    breakdown,
    nextStep,
    activeModuleId,
  } = useLearningPath();

  const [expandedModules, setExpandedModules] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (activeModuleId === null) return;
    setExpandedModules((prev) =>
      prev[activeModuleId] !== undefined
        ? prev
        : { ...prev, [activeModuleId]: true },
    );
  }, [activeModuleId]);

  if (isLoading) return <LearningPathSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <ErrorState
          what="your learning path"
          error={error}
          onRetry={() => void refetch()}
          homeTo="/"
          homeLabel="Back to dashboard"
        />
      </div>
    );
  }

  if (!cohortId || !course) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-line bg-canvas text-accent">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          No active cohort selected
        </h1>
        <p className="mt-2 text-sm text-muted">
          Join or select a cohort from the top bar to view your course roadmap
          and track your progress.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/student/cohorts"
            className="inline-flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
          >
            View my cohorts
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover"
          >
            Go to tasks
          </Link>
        </div>
      </div>
    );
  }

  const activeModule =
    course.modules.find((m) => m.id === activeModuleId) ?? course.modules[0];
  const activeModulePercent = activeModule ? getModulePercent(activeModule) : 0;

  const handleContinue = () => {
    if (!nextStep) return;
    setExpandedModules((prev) => ({ ...prev, [nextStep.moduleId]: true }));
    if (nextStep.kind === "lesson") {
      navigate(`/lessons/${nextStep.lesson.id}`);
      return;
    }
    navigate(`/lessons/${nextStep.lessonId}?task=${nextStep.task.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Hero Course Progress Card ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
              <span>Active Course</span>
              {activeCohort && (
                <>
                  <span className="text-muted">·</span>
                  <span className="text-muted">{activeCohort.name}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {course.title}
            </h1>

            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span className="font-mono">
                  <strong className="text-foreground">
                    {breakdown.percent}%
                  </strong>{" "}
                  complete · {breakdown.completedSteps} of{" "}
                  {breakdown.totalSteps} steps
                </span>
                <span className="font-mono">
                  {course.modules.length}{" "}
                  {course.modules.length === 1 ? "module" : "modules"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-[#3fb950] transition-all duration-300"
                  style={{ width: `${breakdown.percent}%` }}
                />
              </div>
            </div>
          </div>

          {nextStep ? (
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
            >
              <span className="max-w-[240px] truncate">
                Continue: {nextStep.title}
              </span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          ) : (
            <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Course completed
            </div>
          )}
        </div>
      </section>

      {/* ── Main Roadmap + Side Summary Rail ───────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left/Center: Module Roadmap */}
        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
              No modules have been published for this course yet.
            </div>
          ) : (
            course.modules.map((mod, modIndex) => {
              const modPercent = getModulePercent(mod);
              const isExpanded = Boolean(expandedModules[mod.id]);

              return (
                <section
                  key={mod.id}
                  className={`overflow-hidden rounded-xl border border-line bg-surface transition-colors ${
                    mod.is_locked ? "opacity-75" : ""
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedModules((prev) => ({
                        ...prev,
                        [mod.id]: !isExpanded,
                      }))
                    }
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-hover/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold ${
                          mod.is_completed
                            ? "border-emerald-500/40 bg-emerald-500/10 text-success"
                            : mod.is_locked
                              ? "border-line bg-canvas text-muted"
                              : modPercent > 0
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-line bg-canvas text-muted"
                        }`}
                      >
                        {mod.is_completed ? (
                          <CheckCircle2 className="size-4" aria-hidden />
                        ) : mod.is_locked ? (
                          <Lock className="size-3.5" aria-hidden />
                        ) : (
                          String(modIndex + 1).padStart(2, "0")
                        )}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {mod.title}
                        </h2>
                        <p className="mt-0.5 font-mono text-xs text-muted">
                          {mod.total_lessons}{" "}
                          {mod.total_lessons === 1 ? "lesson" : "lessons"}
                          {mod.is_locked ? " · Locked" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium ${
                          mod.is_completed
                            ? "border-emerald-500/30 bg-emerald-500/10 text-success"
                            : modPercent > 0
                              ? "border-accent/30 bg-accent/10 text-accent"
                              : "border-line bg-canvas text-muted"
                        }`}
                      >
                        {modPercent}% · {mod.completed_lessons}/
                        {mod.total_lessons}
                      </span>
                      {isExpanded ? (
                        <ChevronDown
                          className="size-4 text-muted"
                          aria-hidden
                        />
                      ) : (
                        <ChevronRight
                          className="size-4 text-muted"
                          aria-hidden
                        />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-line bg-canvas/40 px-5 py-4">
                      {mod.lessons.length === 0 ? (
                        <p className="text-xs text-muted">
                          No lessons in this module yet.
                        </p>
                      ) : (
                        <ol className="relative space-y-3 border-l border-line pl-6">
                          {mod.lessons.map((lesson) => {
                            const isNextLesson =
                              nextStep?.kind === "lesson" &&
                              nextStep.lesson.id === lesson.id;

                            return (
                              <li key={lesson.id} className="space-y-2.5">
                                {/* Lesson node */}
                                <div
                                  className={`relative flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                                    lesson.is_locked
                                      ? "border-line bg-surface/50 opacity-70"
                                      : isNextLesson
                                        ? "border-accent bg-accent/5"
                                        : "border-line bg-surface hover:border-muted/60"
                                  }`}
                                >
                                  <span
                                    aria-hidden
                                    className={`absolute -left-[31px] flex size-4 items-center justify-center rounded-full border bg-canvas ${
                                      lesson.is_completed
                                        ? "border-emerald-500 text-success"
                                        : isNextLesson
                                          ? "border-accent text-accent"
                                          : "border-line text-muted"
                                    }`}
                                  >
                                    {lesson.is_completed ? (
                                      <CheckCircle2 className="size-3" />
                                    ) : lesson.is_locked ? (
                                      <Lock className="size-2.5" />
                                    ) : (
                                      <Circle className="size-2 fill-current" />
                                    )}
                                  </span>

                                  <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <BookOpen
                                      className={`size-4 shrink-0 ${
                                        lesson.is_completed
                                          ? "text-success"
                                          : lesson.is_locked
                                            ? "text-muted"
                                            : "text-accent"
                                      }`}
                                      aria-hidden
                                    />
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-medium text-foreground">
                                          {lesson.title}
                                        </p>
                                        {isNextLesson && (
                                          <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-accent">
                                            Up next
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted">
                                        {lesson.is_locked
                                          ? "Locked"
                                          : lesson.is_completed
                                            ? "Completed"
                                            : lesson.total_tasks > 0
                                              ? `${lesson.completed_tasks}/${lesson.total_tasks} tasks done`
                                              : lesson.has_content
                                                ? "Lesson notes ready"
                                                : "Lesson overview"}
                                      </p>
                                    </div>
                                  </div>

                                  {lesson.is_locked ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-muted">
                                      <Lock className="size-3" aria-hidden />
                                      Locked
                                    </span>
                                  ) : (
                                    <div className="flex shrink-0 items-center gap-2">
                                      <span
                                        className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                                          lesson.is_completed
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-success"
                                            : "border-line bg-canvas text-muted"
                                        }`}
                                      >
                                        {lesson.completed_tasks}/
                                        {lesson.total_tasks} tasks
                                      </span>
                                      <Link
                                        to={`/lessons/${lesson.id}`}
                                        className="rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-hover"
                                      >
                                        {lesson.is_completed ? "Review" : "Open"}
                                      </Link>
                                    </div>
                                  )}
                                </div>

                                {/* Attached tasks for this lesson */}
                                {lesson.tasks.map((task) => {
                                  const taskDone = isTaskDone(task.status);
                                  const isNextTask =
                                    nextStep?.kind === "task" &&
                                    nextStep.task.id === task.id;
                                  const taskPath = `/lessons/${lesson.id}?task=${task.id}`;

                                  return (
                                    <div
                                      key={task.id}
                                      className={`relative ml-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                                        task.is_locked
                                          ? "border-line bg-surface/40 opacity-70"
                                          : isNextTask
                                            ? "border-accent bg-accent/5"
                                            : "border-line bg-surface/80 hover:border-muted/60"
                                      }`}
                                    >
                                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                        {task.is_locked ? (
                                          <Lock
                                            className="size-4 shrink-0 text-muted"
                                            aria-hidden
                                          />
                                        ) : task.type === "code" ? (
                                          <FileCode2
                                            className={`size-4 shrink-0 ${
                                              taskDone
                                                ? "text-success"
                                                : "text-accent"
                                            }`}
                                            aria-hidden
                                          />
                                        ) : (
                                          <HelpCircle
                                            className={`size-4 shrink-0 ${
                                              taskDone
                                                ? "text-success"
                                                : "text-warning"
                                            }`}
                                            aria-hidden
                                          />
                                        )}
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium text-foreground">
                                              {task.title}
                                            </p>
                                            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                                              {task.type}
                                            </span>
                                            {isNextTask && (
                                              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-accent">
                                                Up next
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-muted">
                                            {task.is_locked
                                              ? "Complete previous steps to unlock"
                                              : formatTaskStatusLabel(
                                                  task.status,
                                                )}
                                          </p>
                                        </div>
                                      </div>

                                      {task.is_locked ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-muted">
                                          <Lock className="size-3" aria-hidden />
                                          Locked
                                        </span>
                                      ) : (
                                        <Link
                                          to={taskPath}
                                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                                            taskDone
                                              ? "border-emerald-500/30 bg-emerald-500/10 text-success hover:bg-emerald-500/15"
                                              : "border-line bg-canvas text-foreground hover:bg-hover"
                                          }`}
                                        >
                                          {taskDone ? "Review" : "Open"}
                                        </Link>
                                      )}
                                    </div>
                                  );
                                })}
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* Right Side Rail */}
        <aside className="space-y-4">
          {activeModule && (
            <div className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent">
                <Sparkles className="size-3.5" aria-hidden />
                <span>Next Milestone</span>
              </div>
              <p className="mt-2.5 text-sm font-semibold text-foreground">
                {activeModule.is_completed
                  ? "All modules completed!"
                  : `Complete ${activeModule.title}`}
              </p>
              <p className="mt-1 text-xs text-muted">
                {activeModule.is_completed
                  ? "Great work finishing every step in this course."
                  : `${Math.max(0, activeModule.total_lessons - activeModule.completed_lessons)} remaining lesson(s) in this module.`}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${activeModulePercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              Course Breakdown
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-body">
                  <BookOpen className="size-4 text-accent" aria-hidden />
                  Lessons
                </dt>
                <dd className="font-mono text-xs font-semibold text-foreground">
                  {breakdown.lessons.done} / {breakdown.lessons.total}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-body">
                  <FileCode2 className="size-4 text-success" aria-hidden />
                  Code tasks
                </dt>
                <dd className="font-mono text-xs font-semibold text-foreground">
                  {breakdown.codeTasks.done} / {breakdown.codeTasks.total}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-body">
                  <HelpCircle className="size-4 text-warning" aria-hidden />
                  Quizzes
                </dt>
                <dd className="font-mono text-xs font-semibold text-foreground">
                  {breakdown.quizzes.done} / {breakdown.quizzes.total}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
