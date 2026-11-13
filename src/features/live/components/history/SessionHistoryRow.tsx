import { CalendarDays, Clock3, FileText, Play, Radio } from "lucide-react";
import { safeRecordingUrl } from "../../types/session";
import type { SessionHistoryEntry } from "../../types/sessionHistory";
import { sessionDuration } from "../../utils/sessionHistory";
import { AttendanceBadge } from "./AttendanceBadge";

interface SessionHistoryRowProps {
  session: SessionHistoryEntry;
  onNotes: (session: SessionHistoryEntry) => void;
  featured?: boolean;
}

export function SessionHistoryRow({
  session,
  onNotes,
  featured = false,
}: SessionHistoryRowProps) {
  const recording = safeRecordingUrl(session.recording_url);
  const duration = sessionDuration(session);
  const date = new Date(session.started_at ?? session.starts_at).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {recording && session.recording_status === "ready" ? (
        <a
          href={`/sessions/${session.id}/watch?cohort=${session.cohort_id}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          <Play className="size-4" aria-hidden /> Watch recording
        </a>
      ) : session.recording_status === "processing" ? (
        <span className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-surface-muted px-3.5 text-sm font-medium text-muted">
          <Radio className="size-4 animate-pulse" aria-hidden /> Recording processing
        </span>
      ) : null}
      {(session.notes || session.lesson) && (
        <button
          type="button"
          onClick={() => onNotes(session)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3.5 text-sm font-semibold text-body hover:bg-hover"
        >
          <FileText className="size-4" aria-hidden /> View notes
        </button>
      )}
    </div>
  );

  if (featured)
    return (
      <article className="grid gap-5 rounded-xl border border-line bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative flex min-h-52 items-center justify-center overflow-hidden rounded-lg border border-line bg-[#0d1117] font-mono text-xs text-[#8b949e]">
          <pre aria-hidden className="absolute inset-0 p-6 leading-7 opacity-70">{`def learn(topic):\n    practice(topic)\n    return "progress"`}</pre>
          <span className="relative flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white">
            <Play className="ml-1 size-6" aria-hidden />
          </span>
          {duration && <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-white">{duration}</span>}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Latest session</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{session.title}</h2>
          <p className="mt-1 text-sm text-muted">{session.module_title}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />{date}</span>
            {duration && <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden />{duration}</span>}
            {session.instructor_name && <span>{session.instructor_name}</span>}
            <AttendanceBadge attendance={session.attendance} />
          </div>
          <div className="mt-5">{actions}</div>
        </div>
      </article>
    );

  return (
    <article className="grid gap-4 border-t border-line p-4 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground">{session.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden />{date}</span>
          {duration && <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden />{duration}</span>}
          <AttendanceBadge attendance={session.attendance} />
        </div>
      </div>
      {actions}
    </article>
  );
}
