import { Flame, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  useCohortLeaderboard,
  type CohortLeaderboardEntry,
} from "@/features/cohorts/Services/leaderboardService";
import { DashboardCard, EmptyState } from "./DashboardCard";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 font-mono text-xs font-bold text-warning">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-400/40 bg-slate-400/15 font-mono text-xs font-bold text-foreground">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-700/15 font-mono text-xs font-bold text-amber-500">
        3
      </span>
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface font-mono text-xs font-medium text-muted">
      {rank}
    </span>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: CohortLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        isCurrentUser
          ? "border-accent/40 bg-accent/[0.08]"
          : "border-line/60 bg-input"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <RankBadge rank={entry.rank} />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hover text-xs font-bold uppercase text-foreground">
          {entry.username.charAt(0)}
        </span>
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate font-mono text-xs font-semibold text-foreground sm:text-sm">
            {entry.username}
          </p>
          {isCurrentUser && (
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
              You
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {entry.current_streak > 0 && (
          <span
            title={`${entry.current_streak}-day streak`}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-warning"
          >
            <Flame className="size-3" aria-hidden />
            {entry.current_streak}d
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
          <Sparkles className="size-3" aria-hidden />
          {entry.total_xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}

export function CohortLeaderboardCard({ cohortId }: { cohortId: number }) {
  const { profile } = useAuth();
  const { data: entries = [], isPending, error, refetch } =
    useCohortLeaderboard(cohortId);

  const topEntries = entries.slice(0, 5);
  const currentUserEntry = profile
    ? entries.find((e) => e.user_id === profile.id)
    : undefined;
  const showPinnedCurrentUser =
    Boolean(currentUserEntry) &&
    !topEntries.some((e) => e.user_id === currentUserEntry!.user_id);

  return (
    <DashboardCard
      title="Cohort Leaderboard"
      action={
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
        >
          <Trophy className="size-3.5 text-warning" aria-hidden />
          <span>Full standings →</span>
        </Link>
      }
    >
      {isPending ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-input" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          variant="section"
          what="cohort leaderboard"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState>No leaderboard rankings for this cohort yet.</EmptyState>
      ) : (
        <div className="space-y-2">
          {topEntries.map((entry) => (
            <LeaderboardRow
              key={entry.user_id}
              entry={entry}
              isCurrentUser={entry.user_id === profile?.id}
            />
          ))}
          {showPinnedCurrentUser && currentUserEntry && (
            <div className="border-t border-dashed border-line pt-2">
              <LeaderboardRow entry={currentUserEntry} isCurrentUser />
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
