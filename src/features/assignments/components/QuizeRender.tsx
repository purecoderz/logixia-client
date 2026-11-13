import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/Markdown";

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correct_choice_id?: string;
  explanation?: string;
}

export interface QuizData {
  title: string;
  type: "quiz";
  instructions: string;
  questions: QuizQuestion[];
  xp?: number;
  status?: string | null;
  due_date?: string;
  student_code?: unknown;
}

export interface QuizRendererProps {
  quiz: QuizData;
  onBack?: () => void;
  backLabel?: string;
  onSubmitAnswers?: (answers: Record<string, string>) => Promise<void> | void;
}

export default function QuizRenderer({
  quiz,
  onBack,
  backLabel = "Back to tasks",
  onSubmitAnswers,
}: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status flags
  const isDeadlinePassed = Boolean(
    quiz.due_date && new Date(quiz.due_date).getTime() < Date.now(),
  );
  const isMissed =
    quiz.status === "missed" ||
    (isDeadlinePassed && quiz.status !== "completed" && quiz.status !== "submitted");
  const isPreviouslyCompleted =
    quiz.status === "completed" || quiz.status === "submitted";

  const totalQuestions = quiz.questions.length;
  const question = quiz.questions[currentIndex] ?? {
    id: "empty",
    prompt: "",
    choices: [],
  };
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === Math.max(0, totalQuestions - 1);
  const progressPercentage = totalQuestions
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
    : 0;

  // Has the student picked an answer for the current question?
  const hasAnsweredCurrent = Boolean(selectedAnswers[question.id]);
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (choiceId: string) => {
    // If already answered for this question or submitting, ignore
    if (hasAnsweredCurrent || isSubmitting) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: choiceId,
    }));
  };

  const handleNext = () => !isLastQuestion && setCurrentIndex((i) => i + 1);
  const handlePrev = () => !isFirstQuestion && setCurrentIndex((i) => i - 1);

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    // Expired or missed quizzes cannot be submitted
    if (isMissed || isPreviouslyCompleted || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (onSubmitAnswers) {
        await onSubmitAnswers(selectedAnswers);
      }
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Couldn't submit quiz. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChoiceStatusClasses = (choiceId: string) => {
    const isSelected = selectedAnswers[question.id] === choiceId;

    // Before student picks: clean unrevealed options
    if (!hasAnsweredCurrent) {
      return isSelected
        ? "border-accent ring-1 ring-accent bg-accent/10 text-foreground"
        : "border-line bg-surface hover:bg-hover text-foreground";
    }

    // After student picks: immediately tell them if they are correct or not
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

  const formattedDueDate = quiz.due_date
    ? new Date(quiz.due_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-1 min-h-0 flex-col gap-4 animate-fade-in text-body">
      {/* ── Fixed Top Section: Back navigation & Quiz Header (do NOT scroll) ── */}
      <div className="shrink-0 flex flex-col gap-3">
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {backLabel}
            </button>

            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Repractice from start
              </button>
            )}
          </div>
        )}

        {/* Quiz Header Banner */}
        <section className="student-card flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <HelpCircle className="size-3.5" aria-hidden />
                Quiz
              </span>

              {/* Status Badges */}
              {isMissed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
                  <AlertCircle className="size-3.5" aria-hidden />
                  {isDeadlinePassed ? "Deadline passed" : "Missed"}
                </span>
              )}
              {quiz.status === "completed" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Completed
                </span>
              )}
              {quiz.status === "submitted" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Submitted
                </span>
              )}
              {!isMissed && quiz.status === "in_progress" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                  In progress
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              {formattedDueDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" aria-hidden />
                  Due {formattedDueDate}
                </span>
              )}
              {typeof quiz.xp === "number" && quiz.xp > 0 && (
                <span className="rounded-md bg-warning/15 px-2.5 py-0.5 font-semibold text-warning">
                  +{quiz.xp} XP
                </span>
              )}
            </div>
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {quiz.title}
          </h1>

          {quiz.instructions && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted line-clamp-2">
              {quiz.instructions}
            </p>
          )}

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
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted border border-line"
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
        className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4"
      >
        {/* Question Card */}
        <article className="student-card rounded-xl border border-line bg-surface p-5 sm:p-6 space-y-4 transition-colors">
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
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all ${
                  hasAnsweredCurrent || isSubmitting
                    ? "cursor-default"
                    : "cursor-pointer"
                } ${getChoiceStatusClasses(choice.id)}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice.id}
                  checked={selectedAnswers[question.id] === choice.id}
                  onChange={() => handleSelect(choice.id)}
                  disabled={hasAnsweredCurrent || isSubmitting}
                  className="size-4 shrink-0 accent-accent cursor-pointer disabled:cursor-default"
                />
                <span className="text-sm font-medium leading-relaxed flex-1">
                  {choice.text}
                </span>
              </label>
            ))}
          </div>

          {/* Explanation Block - immediately shown once student picks an option */}
          {hasAnsweredCurrent && question.explanation && (
            <div className="rounded-lg border-l-4 border-accent bg-surface-muted p-4 space-y-1 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Explanation
              </h4>
              <p className="text-sm text-body leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </article>

        {/* Missed / Expired Status Notice */}
        {isMissed && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger animate-fade-in shrink-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-semibold">
                  {isDeadlinePassed ? "Deadline passed — submissions closed" : "You missed this task"}
                </p>
                <p className="text-xs text-danger/90 mt-0.5">
                  Submissions are closed, but you can still pick options to practice and see instant feedback on each question.
                </p>
              </div>
            </div>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-danger/30 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-hover transition-colors"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Repractice
              </button>
            )}
          </div>
        )}

        {/* Already Submitted Status Banner (prior submission) */}
        {!isMissed && isPreviouslyCompleted && !isSubmitted && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success animate-fade-in shrink-0">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">You already submitted this task</p>
                <p className="text-xs text-success/90 mt-0.5">
                  Your submission has been recorded. You can still practice the quiz questions anytime.
                </p>
              </div>
            </div>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-success/30 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-hover transition-colors"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Repractice
              </button>
            )}
          </div>
        )}

        {/* Official Submission Confirmation Banner (just submitted) */}
        {isSubmitted && (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success animate-fade-in shrink-0">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            <p className="font-medium">
              Quiz completed! Your answers have been submitted.
            </p>
          </div>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger animate-fade-in shrink-0">
            <p className="font-medium">{submitError}</p>
          </div>
        )}
      </div>

      {/* Navigation stays visible while the question content scrolls. */}
      <footer
        data-quiz-navigation
        className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-canvas pb-1 pt-3"
      >
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstQuestion || isSubmitting}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {/* Submit or Navigation Controls on last question */}
          {isLastQuestion ? (
            isMissed ? (
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
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-muted opacity-60 cursor-not-allowed"
                >
                  <AlertCircle className="size-4" aria-hidden />
                  Submissions closed
                </button>
              </div>
            ) : isPreviouslyCompleted ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Repractice
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-muted opacity-60 cursor-not-allowed"
                >
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                  Already submitted
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={
                  isSubmitting ||
                  Object.keys(selectedAnswers).length < totalQuestions
                }
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                Submit Quiz
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLastQuestion || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          )}
      </footer>
    </div>
  );
}

export { QuizRenderer };
