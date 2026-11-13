import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, History, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import {
  StudentSessionService,
  studentSessionKeys,
} from "@/features/live/services/studentSessionService";
import { sessionRoomPath } from "@/features/live/types/session";
import { DashboardCard, EmptyState } from "./DashboardCard";

export function NextClassCard({ cohortId }: { cohortId: number }) {
  const query = useQuery({
    queryKey: studentSessionKeys.list(cohortId),
    queryFn: () => StudentSessionService.list(cohortId),
    staleTime: 60_000,
  });
  const sessions = query.data ?? [];
  const live = sessions.find((session) => session.status === "live");
  const next = sessions
    .filter((session) => session.status === "scheduled")
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const session = live ?? next;

  return (
    <DashboardCard
      title="Live & Next Class"
      action={
        <Link
          to="/live-stream"
          className="text-xs font-medium text-muted hover:text-foreground"
        >
          Open room →
        </Link>
      }
    >
      {query.isPending ? (
        <div className="h-28 animate-pulse rounded-xl bg-input" />
      ) : !session ? (
        <EmptyState>No class scheduled yet.</EmptyState>
      ) : (
        <div
          className={`rounded-xl border p-4 ${
            live
              ? "border-emerald-500/30 bg-emerald-500/[0.06]"
              : "border-line/60 bg-input"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`relative flex size-10 shrink-0 items-center justify-center rounded-lg ${
                live
                  ? "bg-success/15 text-success"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {live ? (
                <>
                  <Radio className="size-5" aria-hidden />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500 animate-ping" />
                </>
              ) : (
                <CalendarDays className="size-5" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  live ? "text-success" : "text-accent"
                }`}
              >
                {live ? "Live now" : "Coming up"}
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                {session.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {session.module_title}
              </p>
              <p className="mt-2 text-xs text-body">
                {new Date(session.starts_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          {live && (
            <Link
              to={sessionRoomPath(session.id)}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Join class
            </Link>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to="/lessons"
          className="flex items-center gap-2 rounded-xl border border-line/60 bg-input px-3 py-2.5 text-xs font-medium text-body transition-colors hover:border-line-strong hover:bg-hover hover:text-foreground"
        >
          <BookOpen className="size-4 shrink-0 text-accent" aria-hidden />
          <span className="truncate">Learning Path</span>
        </Link>
        <Link
          to="/history"
          className="flex items-center gap-2 rounded-xl border border-line/60 bg-input px-3 py-2.5 text-xs font-medium text-body transition-colors hover:border-line-strong hover:bg-hover hover:text-foreground"
        >
          <History className="size-4 shrink-0 text-accent" aria-hidden />
          <span className="truncate">Session History</span>
        </Link>
      </div>
    </DashboardCard>
  );
}
