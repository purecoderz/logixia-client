import type { ReactNode } from "react";
import type { CohortSession } from "../../types/session";

/** Stacks actions beneath the content on phones, without squeezing the title. */
export function SessionScheduleCard({ session, children }: { session: CohortSession; children: ReactNode }) {
  const date = new Date(session.starts_at);
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
            <span className="text-[10px] font-semibold uppercase text-accent">{date.toLocaleDateString(undefined, { month: "short" })}</span>
            <span className="text-xl font-semibold text-foreground">{date.getDate()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold text-foreground">{session.title}</h3>
            <p className="mt-1 break-words text-xs text-muted">{session.lesson_title ?? "Session teaching notes"}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 xl:max-w-[50%] xl:justify-end xl:border-0 xl:pt-0">
          <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${session.status === "live" ? "bg-emerald-500/10 text-success" : "bg-hover text-muted"}`}>
            {{ scheduled: "Scheduled", live: "Live", ended: "Ended", cancelled: "Cancelled" }[session.status]}
          </span>
          {children}
        </div>
      </div>
    </article>
  );
}
