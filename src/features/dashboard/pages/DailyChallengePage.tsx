import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  HelpCircle,
  Loader2,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import QuizRenderer, {
  type QuizData,
} from "@/features/assignments/components/QuizeRender";
import { TaskInstructions } from "@/features/assignments/components/TaskInstructions";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import { StreakBoardCard } from "../components/student/StreakBoardCard";
import {
  useSubmitDailyChallenge,
  useTodayDailyChallenge,
} from "../services/dailyChallengeService";
import {
  DAILY_CHALLENGE_BANK,
  DIFFICULTY_META,
  useDailyChallenge,
} from "../services/dailyChallengeStore";

export function DailyChallengePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSolving = searchParams.get("solve") === "1";

  const { difficulty, question, isSolved, submitChoice } = useDailyChallenge();
  const todayQuery = useTodayDailyChallenge(difficulty);
  const submitMutation = useSubmitDailyChallenge();
  const [codeResult, setCodeResult] = useState<"idle" | "passed" | "failed">(
    "idle",
  );
  const meta = DIFFICULTY_META[difficulty];

  const remote = todayQuery.data ?? null;
  const activeTitle = remote ? remote.title : question.title;
  const activeCategory = remote ? remote.category : question.category;
  const activeXp = remote ? remote.xp : question.xp;
  const completedToday = remote ? Boolean(remote.completed) : isSolved;
  const isCodeChallenge = remote?.challenge_type === "code";

  const quizData: QuizData = useMemo(() => {
    if (remote && remote.challenge_type === "quiz") {
      return {
        title: remote.title,
        type: "quiz",
        instructions: `${meta.description}. Complete today's challenge to earn +${remote.xp} XP and extend your streak.`,
        xp: remote.xp,
        status: remote.completed ? "completed" : "in_progress",
        questions: [
          {
            id: String(remote.id),
            prompt: `### ${remote.title} (${remote.category})\n\n${remote.prompt}`,
            choices: remote.choices ?? [],
            correct_choice_id: remote.correct_choice_id ?? "",
            explanation: remote.explanation ?? undefined,
          },
        ],
      };
    }

    const pool = DAILY_CHALLENGE_BANK.filter(
      (q) => q.difficulty === difficulty,
    );
    const ordered = [question, ...pool.filter((q) => q.id !== question.id)];

    return {
      title: question.title,
      type: "quiz",
      instructions: `${meta.description}. Complete today's challenge to earn +${question.xp} XP and extend your streak.`,
      xp: question.xp,
      status: isSolved ? "completed" : "in_progress",
      questions: ordered.map((item) => ({
        id: item.id,
        prompt: item.codeSnippet
          ? `### ${item.title} (${item.category})\n\n${item.prompt}\n\n\`\`\`\n${item.codeSnippet}\n\`\`\``
          : `### ${item.title} (${item.category})\n\n${item.prompt}`,
        choices: item.choices,
        correct_choice_id: item.correctChoiceId,
        explanation: item.explanation,
      })),
    };
  }, [difficulty, isSolved, meta, question, remote]);

  const openChallenge = () => setSearchParams({ solve: "1" });
  const closeChallenge = () => setSearchParams({});

  if (isSolving) {
    if (isCodeChallenge && remote) {
      return (
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeChallenge}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to Daily Challenge
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${meta.badgeClass}`}
              >
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <Sparkles size={12} aria-hidden />+{remote.xp} XP
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
            <CodeWorkspace
              embedded
              layout="split"
              title={remote.title}
              storageKey={`daily-challenge:${remote.id}`}
              starterFiles={remote.starter_files ?? { "main.py": "" }}
              asideTitle="Challenge"
              aside={
                <TaskInstructions
                  instructions={remote.prompt}
                  xp={remote.xp}
                  dueDate={remote.challenge_date}
                />
              }
              asideFooter={({ getFiles }) => (
                <div className="flex items-center gap-2">
                  {codeResult === "passed" && (
                    <span className="text-xs font-semibold text-success">
                      +{remote.xp} XP
                    </span>
                  )}
                  {codeResult === "failed" && (
                    <span className="text-xs font-semibold text-danger">
                      Try again
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={submitMutation.isPending || completedToday}
                    onClick={async () => {
                      const res = await submitMutation.mutateAsync({
                        challenge_id: remote.id,
                        student_code: getFiles(),
                      });
                      setCodeResult(res?.is_correct ? "passed" : "failed");
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-50"
                  >
                    {submitMutation.isPending ? (
                      <Loader2
                        size={13}
                        className="animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Check size={13} aria-hidden />
                    )}
                    {completedToday ? "Completed" : "Submit"}
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      );
    }

    return (
      <QuizRenderer
        key={`${difficulty}-${remote?.id ?? "local"}`}
        quiz={quizData}
        backLabel="Back to Daily Challenge"
        onBack={closeChallenge}
        onSubmitAnswers={(answers) => {
          if (remote) {
            const picked = answers[String(remote.id)];
            if (picked) {
              void submitMutation.mutateAsync({
                challenge_id: remote.id,
                selected_choice_id: picked,
              });
            }
            return;
          }
          const picked = answers[question.id];
          if (picked) {
            submitChoice(picked);
          }
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Zap size={22} aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Daily Challenge
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${meta.badgeClass}`}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              One focused challenge a day tailored to your level. Complete it to
              earn XP and keep your streak alive.
            </p>
          </div>
        </div>

        <Link
          to="/settings?section=display"
          className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-line bg-input px-3 text-xs font-semibold text-body transition-colors hover:bg-hover hover:text-foreground sm:self-auto"
        >
          <Settings2 size={14} aria-hidden />
          Change level
        </Link>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {isCodeChallenge ? (
                  <Code2 size={13} aria-hidden />
                ) : (
                  <HelpCircle size={13} aria-hidden />
                )}
                {isCodeChallenge ? "Coding Challenge" : "Daily Quiz"}
              </span>
              <span className="rounded-full border border-line bg-input px-2.5 py-0.5 text-xs font-medium text-muted">
                {activeCategory}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                <Sparkles size={12} aria-hidden />+{activeXp} XP
              </span>
              {completedToday ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  <CheckCircle2 size={13} aria-hidden />
                  Completed today
                </span>
              ) : (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Ready
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Today’s Challenge
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-foreground sm:text-xl">
                {activeTitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{meta.description}.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openChallenge}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            {completedToday ? "Review Challenge" : "Start Challenge"}
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </section>

      <StreakBoardCard />
    </div>
  );
}

export default DailyChallengePage;
