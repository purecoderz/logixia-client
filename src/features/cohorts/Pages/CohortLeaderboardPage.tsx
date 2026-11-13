import { Crown, Flame, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ActiveCohortRequired } from "../components/students/ActiveCohortRequired";
import { useActiveCohort } from "../hooks/useActiveCohort";
import {
  useCohortLeaderboard,
  type CohortLeaderboardEntry,
} from "../Services/leaderboardService";

function PodiumCard({
  entry,
  isCurrentUser,
}: {
  entry: CohortLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const isFirst = entry.rank === 1;
  const isSecond = entry.rank === 2;

  const badgeTone = isFirst
    ? "border-amber-500/40 bg-amber-500/15 text-warning"
    : isSecond
      ? "border-slate-400/40 bg-slate-400/15 text-foreground"
      : "border-amber-700/40 bg-amber-700/15 text-amber-500";

  return (
    <article
      className={`student-card relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
        isFirst
          ? "border-amber-500/40 bg-amber-500/[0.06]"
          : isCurrentUser
            ? "border-accent/40 bg-accent/[0.06]"
            : "border-line bg-surface"
      }`}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold ${badgeTone}`}
      >
        {isFirst && <Crown className="size-3.5" aria-hidden />}
        #{entry.rank}
      </span>

      <span className="mt-3 flex size-12 items-center justify-center rounded-full border border-line bg-hover text-base font-bold uppercase text-foreground">
        {entry.username.charAt(0)}
      </span>

      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        <h2 className="truncate font-mono text-sm font-bold text-foreground">
          {entry.username}
        </h2>
        {isCurrentUser && (
          <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
            You
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
          <Sparkles className="size-3.5" aria-hidden />
          {entry.total_xp.toLocaleString()} XP
        </span>
        {entry.current_streak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 font-mono text-xs font-semibold text-warning">
            <Flame className="size-3.5" aria-hidden />
            {entry.current_streak}d
          </span>
        )}
      </div>
    </article>
  );
}

export function CohortLeaderboardPage() {
  const { profile } = useAuth();
  const membership = useActiveCohort();

  const cohortId = membership.activeCohort?.id ?? null;
  const {
    data: entries = [],
    isPending,
    error,
    refetch,
  } = useCohortLeaderboard(cohortId);

  if (membership.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Loading your cohorts…
      </p>
    );
  }

  if (membership.error) {
    return (
      <ErrorState
        what="your cohorts"
        error={membership.error}
        onRetry={() => void membership.refetch()}
      />
    );
  }

  if (!membership.activeCohort) {
    return (
      <ActiveCohortRequired
        cohorts={membership.cohorts}
        onSelect={membership.selectCohort}
      />
    );
  }

  const currentUserEntry = profile
    ? entries.find((e) => e.user_id === profile.id)
    : undefined;
  const podium = entries.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="student-dashboard-hero flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/[0.08] p-5 sm:p-6">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            <GraduationCap className="size-3.5" aria-hidden />
            <span className="truncate">{membership.activeCohort.name}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Cohort Leaderboard
          </h1>
          <p className="mt-1 text-sm text-body">
            Standings ranked by total XP earned and active daily streaks.
          </p>
        </div>

        {currentUserEntry && (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
            <Trophy className="size-5 text-warning" aria-hidden />
            <div>
              <p className="text-[11px] font-medium text-muted">Your Standing</p>
              <p className="font-mono text-sm font-bold text-foreground">
                Rank #{currentUserEntry.rank} ·{" "}
                {currentUserEntry.total_xp.toLocaleString()} XP
              </p>
            </div>
          </div>
        )}
      </header>

      {isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading leaderboard…
        </p>
      ) : error ? (
        <ErrorState
          what="the cohort leaderboard"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          No leaderboard rankings recorded for this cohort yet.
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <section
              aria-label="Top 3 podium"
              className="grid gap-4 sm:grid-cols-3"
            >
              {podium.map((entry) => (
                <PodiumCard
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === profile?.id}
                />
              ))}
            </section>
          )}

          <section className="student-card overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                All Cohort Standings ({entries.length})
              </h2>
            </div>
            <div className="divide-y divide-line/60">
              {entries.map((entry) => {
                const isCurrentUser = entry.user_id === profile?.id;
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                      isCurrentUser ? "bg-accent/[0.06]" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                          entry.rank === 1
                            ? "border-amber-500/40 bg-amber-500/15 text-warning"
                            : entry.rank === 2
                              ? "border-slate-400/40 bg-slate-400/15 text-foreground"
                              : entry.rank === 3
                                ? "border-amber-700/40 bg-amber-700/15 text-amber-500"
                                : "border-line bg-input text-muted"
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-hover text-xs font-bold uppercase text-foreground">
                        {entry.username.charAt(0)}
                      </span>
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-mono text-sm font-semibold text-foreground">
                          {entry.username}
                        </p>
                        {isCurrentUser && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-warning">
                        <Flame className="size-3.5" aria-hidden />
                        {entry.current_streak}d streak
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                        <Sparkles className="size-3.5" aria-hidden />
                        {entry.total_xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default CohortLeaderboardPage;
