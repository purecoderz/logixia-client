import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  useDailyChallengeActivity,
  useTodayDailyChallenge,
} from "../../services/dailyChallengeService";
import {
  DIFFICULTY_META,
  useDailyChallenge,
} from "../../services/dailyChallengeStore";
import { DashboardCard } from "./DashboardCard";

export function DailyChallengeCard() {
  const { profile } = useAuth();
  const { difficulty, question, isSolved: localSolved, completedDaysCount } =
    useDailyChallenge();
  const todayQuery = useTodayDailyChallenge(difficulty);
  const activityQuery = useDailyChallengeActivity();

  const remote = todayQuery.data ?? null;
  const isSolved = remote ? Boolean(remote.completed) : localSolved;
  const activeTitle = remote ? remote.title : question.title;
  const activeCategory = remote ? remote.category : question.category;
  const activeXp = remote ? remote.xp : question.xp;
  const streakCount =
    activityQuery.data?.current_streak ??
    Math.max(profile?.current_streak ?? 0, completedDaysCount);

  const meta = DIFFICULTY_META[difficulty];

  return (
    <DashboardCard
      title="Daily Challenge"
      action={
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
          <Link
            to="/settings?section=display"
            title="Change daily challenge difficulty in settings"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <Settings2 className="size-3.5" aria-hidden />
            <span>Level</span>
          </Link>
        </div>
      }
    >
      <div
        className={`rounded-xl border p-4 ${
          isSolved
            ? "border-emerald-500/30 bg-emerald-500/[0.06]"
            : "border-line/60 bg-input"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
              isSolved
                ? "bg-success/15 text-success"
                : "bg-accent/10 text-accent"
            }`}
          >
            {isSolved ? (
              <CheckCircle2 className="size-5" aria-hidden />
            ) : (
              <Zap className="size-5" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isSolved ? "text-success" : "text-accent"
                }`}
              >
                {isSolved ? "Completed today" : activeCategory}
              </p>
              <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                <Sparkles className="size-3" aria-hidden />+{activeXp} XP
              </span>
              {streakCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                  <Flame className="size-3" aria-hidden />
                  {streakCount}d streak
                </span>
              )}
            </div>
            <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
              {activeTitle}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {isSolved
                ? `You earned +${activeXp} XP on today's ${meta.label.toLowerCase()} challenge.`
                : meta.description}
            </p>
          </div>
        </div>

        <Link
          to="/daily-challenge"
          className={`mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors ${
            isSolved
              ? "border border-line bg-surface text-foreground hover:bg-hover"
              : "bg-accent text-on-accent hover:bg-accent-hover"
          }`}
        >
          <span>{isSolved ? "Review challenge" : "Start challenge"}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </DashboardCard>
  );
}
