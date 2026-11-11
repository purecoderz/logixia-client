import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type {
  SessionHistoryEntry,
  SessionHistoryFilter,
} from "../../types/sessionHistory";
import {
  groupHistoryByModule,
  matchesHistoryFilter,
} from "../../utils/sessionHistory";
import { SessionHistoryRow } from "./SessionHistoryRow";

const filters: { value: SessionHistoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "present", label: "Attended" },
  { value: "absent", label: "Missed" },
  { value: "not-recorded", label: "Not recorded" },
];

export function SessionHistoryView({
  sessions,
  onNotes,
}: {
  sessions: SessionHistoryEntry[];
  onNotes: (session: SessionHistoryEntry) => void;
}) {
  const [filter, setFilter] = useState<SessionHistoryFilter>("all");
  const sorted = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          Date.parse(b.started_at ?? b.starts_at) -
          Date.parse(a.started_at ?? a.starts_at),
      ),
    [sessions],
  );
  const latest = sorted[0] ?? null;
  const visible = sorted.filter((session) =>
    matchesHistoryFilter(session, filter),
  );
  const groups = groupHistoryByModule(visible);

  return (
    <div className="space-y-6">
      {latest && <SessionHistoryRow session={latest} onNotes={onNotes} featured />}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All sessions</h2>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter session history">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${filter === item.value ? "border-accent bg-accent text-on-accent" : "border-line text-muted hover:bg-hover hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {groups.map((group) => (
          <details
            key={group.id}
            open
            className="group overflow-hidden rounded-xl border border-line bg-surface"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 bg-surface-muted px-4 py-3 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2">
                <ChevronDown
                  className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
                <span className="truncate font-semibold text-foreground">
                  {group.title}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted">
                {group.sessions.length}{" "}
                {group.sessions.length === 1 ? "session" : "sessions"}
              </span>
            </summary>
            <div className="border-t border-line">
              {group.sessions.map((session) => (
                <SessionHistoryRow
                  key={session.id}
                  session={session}
                  onNotes={onNotes}
                />
              ))}
            </div>
          </details>
        ))}
        {!visible.length && (
          <div className="rounded-xl border border-dashed border-line px-5 py-12 text-center">
            <CalendarDays className="mx-auto size-7 text-muted" aria-hidden />
            <h3 className="mt-3 font-semibold text-foreground">No matching sessions</h3>
            <p className="mt-1 text-sm text-muted">Try another attendance filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
