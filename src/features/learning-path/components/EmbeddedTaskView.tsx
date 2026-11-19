import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, FlaskConical, Loader2, Lock } from "lucide-react";
import type { TerminalLine } from "@/components/SmartTerminal/TerminalView";
import { WorkspaceSkeleton } from "@/components/ui/TaskSkeletons";
import QuizRenderer from "@/features/assignments/components/QuizeRender";
import { TaskInstructions } from "@/features/assignments/components/TaskInstructions";
import { pickInitialTaskFiles } from "@/features/assignments/services/assignmentService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import { formatCheckResultsLines } from "@/features/workspace/utils/formatCheckResults";
import { friendlyMessage } from "@/lib/apiError";
import { LearningPathService } from "../services/learningPathService";
import type { StudentLessonTask } from "../types";

interface EmbeddedTaskViewProps {
  cohortId: number;
  task: StudentLessonTask;
  nextStep?: { path: string; label: string } | null;
  onBackToLesson: () => void;
}

const SUBMIT_STEPS = [
  "Sending code…",
  "Validating syntax…",
  "Running checks…",
  "Finalizing submission…",
];

export function EmbeddedTaskView({
  cohortId,
  task,
  nextStep = null,
  onBackToLesson,
}: EmbeddedTaskViewProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const id = String(task.id);

  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "submitted" | "error" | "practiced"
  >("idle");
  const [submitStep, setSubmitStep] = useState(0);
  const [lastPassed, setLastPassed] = useState<boolean | null>(null);
  const [completedNow, setCompletedNow] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [quizCompletedNow, setQuizCompletedNow] = useState(false);

  useEffect(() => {
    setSubmitState("idle");
    setLastPassed(null);
    setCompletedNow(false);
    setQuizCompletedNow(false);
    setCooldownSeconds(0);
  }, [task.id]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (submitState !== "submitting") return;
    setSubmitStep(0);
    const timer = window.setInterval(() => {
      setSubmitStep((step) =>
        step < SUBMIT_STEPS.length - 1 ? step + 1 : step,
      );
    }, 900);
    return () => window.clearInterval(timer);
  }, [submitState]);

  if (task.is_locked) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-6 text-center">
          <Lock className="mx-auto size-6 text-muted" aria-hidden />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            {task.title} is locked
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Complete the previous step to unlock this task.
          </p>
          <button
            type="button"
            onClick={onBackToLesson}
            className="mt-4 rounded-lg border border-line bg-canvas px-4 py-2 text-xs font-medium text-foreground hover:bg-hover"
          >
            Back to lesson
          </button>
        </div>
      </div>
    );
  }

  if (task.type === "quiz") {
    const showQuizNext =
      nextStep &&
      (quizCompletedNow ||
        task.status === "completed" ||
        task.status === "submitted");

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3">
          <QuizRenderer
            key={`quiz:${task.id}`}
            quiz={{
              title: task.title,
              type: "quiz",
              instructions: task.instructions ?? "",
              questions: task.questions,
              status: task.status,
              selected_answers: task.selected_answers,
            }}
            onBack={onBackToLesson}
            backLabel="Back to lesson"
            onSubmitAnswers={async (answers) => {
              const result = await LearningPathService.submitQuizTask(
                cohortId,
                task.id,
                answers,
              );
              setQuizCompletedNow(true);
              void queryClient.invalidateQueries({
                queryKey: ["learning-path"],
              });
              return result;
            }}
          />
          {showQuizNext && (
            <div className="flex shrink-0 items-center justify-end border-t border-line pt-3">
              <Link
                to={nextStep.path}
                className="inline-flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2ea043]"
              >
                <span>{nextStep.label}</span>
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <WorkspaceSkeleton label="Preparing workspace" />
      </div>
    );
  }

  const isMissed = task.status === "missed";
  const isPreviouslyCompleted =
    task.status === "completed" ||
    task.status === "submitted" ||
    completedNow;
  const isPracticeMode = isMissed || isPreviouslyCompleted;
  const isPracticed = submitState === "practiced";

  const initialFiles = pickInitialTaskFiles(
    task.student_code,
    task.starter_files,
  );

  const submit = async (
    files: Record<string, string>,
    appendTerminalLines: (lines: TerminalLine[]) => void,
  ) => {
    if (submitState === "submitting" || cooldownSeconds > 0) return;
    setSubmitState("submitting");
    setLastPassed(null);
    try {
      const result = await LearningPathService.submitCodeTask(
        cohortId,
        task.id,
        files,
      );

      if (result) {
        const tests = Array.isArray(result.tests) ? result.tests : [];
        const passedCount = tests.filter((t) => t.passed).length;
        appendTerminalLines(
          formatCheckResultsLines({
            title: isPracticeMode
              ? "Practice Check Results"
              : "Submission Results",
            passed: result.passed,
            checks: tests,
            summaryText: result.passed
              ? `Result: ${passedCount}/${tests.length} checks passed${result.submission_status ? ` (${result.submission_status})` : ""}`
              : undefined,
          }),
        );
        setLastPassed(result.passed);
        if (!isPracticeMode && result.passed) {
          setCompletedNow(true);
          void queryClient.invalidateQueries({ queryKey: ["learning-path"] });
        }
      }
      setSubmitState(isPracticeMode ? "practiced" : "submitted");
    } catch (err) {
      appendTerminalLines([
        {
          kind: "stderr",
          text: `Submission failed: ${friendlyMessage(err, "Please try again.")}`,
        },
      ]);
      setSubmitState("error");
    } finally {
      setCooldownSeconds(5);
    }
  };

  const baseLabel =
    submitState === "submitting"
      ? isPracticeMode
        ? "Running…"
        : "Submitting…"
      : isPracticed
        ? "Run again"
        : isPracticeMode
          ? "Run & check"
          : submitState === "submitted"
            ? "Resubmit"
            : "Submit";

  const btnLabel =
    cooldownSeconds > 0 && submitState !== "submitting"
      ? `${baseLabel} (${cooldownSeconds}s)`
      : baseLabel;

  const footerText =
    submitState === "submitting"
      ? SUBMIT_STEPS[submitStep]
      : isPracticed
        ? lastPassed === false
          ? "Some checks failed — see terminal."
          : "Practice run complete!"
        : submitState === "submitted"
          ? lastPassed === false
            ? "Submitted with failing checks — see terminal."
            : "All checks passed!"
          : submitState === "error"
            ? "Couldn't submit. Try again."
            : isPracticeMode
              ? "Practice mode — already submitted."
              : "Submit when ready.";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CodeWorkspace
        key={`lesson-task:${profile.id}:${task.id}`}
        embedded
        storageMode="memory"
        layout="split"
        storageKey={`assignment:${profile.id}:${id}`}
        title={task.title}
        starterFiles={initialFiles}
        runDisabled={submitState === "submitting"}
        asideTitle={task.title}
        aside={<TaskInstructions instructions={task.instructions ?? ""} />}
        asideFooter={({ nodes, getFiles, appendTerminalLines }) => (
          <div className="flex items-center gap-2.5">
            <p
              role="status"
              aria-live="polite"
              className="hidden truncate text-xs text-muted xl:inline"
            >
              {footerText}
            </p>
            <button
              type="button"
              onClick={() => void submit(getFiles(), appendTerminalLines)}
              disabled={
                submitState === "submitting" ||
                cooldownSeconds > 0 ||
                nodes.length === 0
              }
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isPracticeMode
                  ? "bg-[#1f6feb] hover:bg-[#388bfd]"
                  : "bg-[#238636] hover:bg-[#2ea043]"
              }`}
            >
              {submitState === "submitting" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : isPracticed || submitState === "submitted" ? (
                <Check className="size-3.5" aria-hidden />
              ) : isPracticeMode ? (
                <FlaskConical className="size-3.5" aria-hidden />
              ) : null}
              {btnLabel}
            </button>
            {isPracticeMode && nextStep && (
              <Link
                to={nextStep.path}
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#238636] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#2ea043]"
              >
                <span className="max-w-[140px] truncate">{nextStep.label}</span>
                <ArrowRight className="size-3.5 shrink-0" aria-hidden />
              </Link>
            )}
          </div>
        )}
      />
    </div>
  );
}
