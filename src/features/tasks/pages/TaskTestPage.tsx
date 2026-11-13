import "@/features/theme/learning-shell.css";
import "@/layouts/StudentLayout/student-theme.css";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  FlaskConical,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FormError } from "@/components/ui/FormError";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { TaskService } from "../services/taskService";
import { TASKS_PATH, taskEditorPath } from "../paths";
import type { TaskDocument } from "../taskForm";
import type { TaskTestResult, TaskTestSubmission } from "../taskTest";
import { TaskTestResults } from "../components/TaskTestResults";

export default function TaskTestPage() {
  const { courseId, taskId } = useParams();
  const outline = useCourseOutline(courseId);
  const task = useQuery({
    queryKey: ["instructor-task", taskId],
    queryFn: () => TaskService.get(taskId!),
    enabled: Boolean(taskId),
  });
  const failed = outline.isError ? outline : task.isError ? task : null;
  if (failed)
    return (
      <div className="min-h-screen bg-canvas p-6">
        <ErrorState
          what="this task"
          error={failed.error}
          onRetry={() => void failed.refetch()}
        />
      </div>
    );
  if (outline.isPending || task.isPending)
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-canvas text-body"
        role="status"
      >
        <Spinner /> Loading task…
      </div>
    );
  if (
    !courseId ||
    !taskId ||
    !task.data ||
    (!task.data.owner_cohort_id && !outline.data?.modules.some((module) =>
      module.lessons.some((lesson) => lesson.id === task.data.lesson_id),
    ))
  )
    return (
      <ErrorState
        what="this task"
        error={new ApiError("Task not found in this course", 404)}
        homeTo={TASKS_PATH}
      />
    );
  const content = (
    <TestTask key={taskId} courseId={courseId} task={task.data} />
  );
  // Code workspaces remain dark; only the standalone MCQ test uses the saved app theme.
  return task.data.type === "quiz" ? (
    <ThemeProvider>{content}</ThemeProvider>
  ) : (
    content
  );
}

function TestTask({
  courseId,
  task,
}: {
  courseId: string;
  task: TaskDocument;
}) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TaskTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const back = `${TASKS_PATH}?course=${encodeURIComponent(courseId)}`;
  async function test(submission: TaskTestSubmission) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await TaskService.test(String(task.id), submission));
    } catch (err) {
      setError(
        friendlyMessage(err, "Couldn’t test the task. Please try again."),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  const explanation = (
    <p className="text-xs leading-relaxed text-muted">
      Instructor test mode. Uses saved task settings. No student submission,
      enrolment, score or task content is changed.
    </p>
  );
  if (task.type === "code")
    return (
      <CodeWorkspace
        title={`Test · ${task.title}`}
        layout="split"
        storageKey={`instructor-task-test:${profile?.id}:${task.id}`}
        starterFiles={task.starter_files}
        onBack={() => navigate(back)}
        toolbar={
          <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-[#8b949e]">
            <FlaskConical className="size-4 text-[#58a6ff]" aria-hidden />
            <strong className="font-semibold text-[#f0f6fc]">
              Instructor test workspace
            </strong>
            <span className="hidden sm:inline">
              Isolated from student drafts and official submissions
            </span>
          </div>
        }
        asideTitle="Test task"
        aside={
          <div className="space-y-4 p-4">
            <h1 className="text-lg font-semibold text-foreground">
              {task.title}
            </h1>
            {explanation}
            <MarkdownRenderer content={task.instructions} />
            <p className="text-xs text-muted">
              Use main.py as the entry point. Run code in the terminal, then
              test your solution against the task’s saved checks.
            </p>
            <ButtonLink variant="ghost" to={taskEditorPath(courseId, task.id)}>
              Edit task
            </ButtonLink>
            {error && <FormError message={error} />}{" "}
            {result && <TaskTestResults result={result} />}
          </div>
        }
        asideFooter={({ getFiles }) => (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">Tests run on the backend.</p>
            <Button
              disabled={busy}
              aria-busy={busy}
              onClick={() => void test({ files: getFiles() })}
            >
              {busy ? (
                <>
                  <Spinner tone="dark" /> Testing…
                </>
              ) : (
                "Test solution"
              )}
            </Button>
          </div>
        )}
      />
    );
  const totalQuestions = task.questions.length;
  const question = task.questions[currentIndex] ?? {
    id: "empty",
    prompt: "",
    choices: [],
    correct_choice_id: "",
    explanation: "",
  };
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === Math.max(0, totalQuestions - 1);
  const progressPercentage = totalQuestions
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
    : 0;
  const hasAnsweredCurrent = Boolean(answers[question.id]);
  const answeredCount = Object.keys(answers).length;

  const handleDone = () => {
    const idx =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number"
        ? window.history.state.idx
        : 0;
    if (idx > 0) {
      navigate(-1);
      return;
    }
    navigate(back);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setError(null);
  };

  const getChoiceStatusClasses = (choiceId: string) => {
    const isSelected = answers[question.id] === choiceId;

    if (!hasAnsweredCurrent) {
      return isSelected
        ? "border-accent ring-1 ring-accent bg-accent/10 text-foreground"
        : "border-line bg-surface hover:bg-hover text-foreground";
    }

    const hasAnswerKey = Boolean(question.correct_choice_id);
    if (!hasAnswerKey) {
      return isSelected
        ? "border-accent bg-accent/15 text-accent font-semibold"
        : "border-line bg-surface text-muted opacity-60";
    }

    const isCorrect = choiceId === question.correct_choice_id;
    if (isCorrect) {
      return "border-success bg-success/15 text-success font-semibold";
    }
    if (isSelected && !isCorrect) {
      return "border-danger bg-danger/15 text-danger font-semibold";
    }
    return "border-line bg-surface text-muted opacity-50";
  };

  return (
    <main
      data-student-shell
      data-student-content
      className="flex h-dvh flex-col overflow-hidden bg-canvas px-4 py-4 text-body sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 animate-fade-in text-body">
        {/* ── Fixed Top Section: Back navigation & Quiz Header (do NOT scroll) ── */}
        <div className="flex shrink-0 flex-col gap-3">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={back}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to tasks
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Repractice from start
                </button>
              )}
              <ButtonLink variant="ghost" to={taskEditorPath(courseId, task.id)}>
                Edit quiz
              </ButtonLink>
              <ThemeToggle />
            </div>
          </header>

          {/* Quiz Header Banner */}
          <section className="student-card flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  <HelpCircle className="size-3.5" aria-hidden />
                  Quiz
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-muted">
                  <FlaskConical className="size-3.5 text-accent" aria-hidden />
                  Instructor test mode
                </span>
              </div>
            </div>

            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Test · {task.title}
            </h1>

            {task.instructions && (
              <div className="line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
                <MarkdownRenderer content={task.instructions} />
              </div>
            )}

            {explanation}

            {/* Progress Bar inside Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span>{progressPercentage}% completed</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full overflow-hidden rounded-full border border-line bg-surface-muted"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* ── Scrollable Questions Section: ONLY this part scrolls ── */}
        <div
          data-quiz-scroll-region
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1"
        >
          <article className="student-card space-y-4 rounded-xl border border-line bg-surface p-5 transition-colors sm:p-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Question {currentIndex + 1}
              </span>
              <div className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                <MarkdownRenderer content={question.prompt} />
              </div>
            </div>

            {/* Dynamic Options List */}
            <div
              className="space-y-2.5"
              role="radiogroup"
              aria-label={question.prompt}
            >
              {question.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 transition-all ${
                    busy ? "cursor-default" : "cursor-pointer"
                  } ${getChoiceStatusClasses(choice.id)}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={answers[question.id] === choice.id}
                    onChange={() => {
                      if (busy) return;
                      setAnswers((old) => ({
                        ...old,
                        [question.id]: choice.id,
                      }));
                      setResult(null);
                      setError(null);
                    }}
                    disabled={busy}
                    className="size-4 shrink-0 cursor-pointer accent-accent disabled:cursor-default"
                  />
                  <span className="flex-1 text-sm font-medium leading-relaxed">
                    {choice.text}
                  </span>
                </label>
              ))}
            </div>

            {/* Explanation Block - immediately shown once an option is selected */}
            {hasAnsweredCurrent && question.explanation && (
              <div className="animate-fade-in space-y-1 rounded-lg border-l-4 border-accent bg-surface-muted p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Explanation
                </h4>
                <p className="text-sm leading-relaxed text-body">
                  {question.explanation}
                </p>
              </div>
            )}
          </article>
        </div>

        {/* ── Navigation stays visible while the question content scrolls ── */}
        <footer
          data-quiz-navigation
          className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-canvas pb-1 pt-3"
        >
          <button
            type="button"
            onClick={() => !isFirstQuestion && setCurrentIndex((i) => i - 1)}
            disabled={isFirstQuestion}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <div className="flex items-center gap-2">
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Repractice
                </button>
              )}
              <button
                type="button"
                onClick={handleDone}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => !isLastQuestion && setCurrentIndex((i) => i + 1)}
              disabled={isLastQuestion}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
