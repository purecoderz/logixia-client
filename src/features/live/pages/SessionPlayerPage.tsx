import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Play,
  VideoOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchBar } from "@/components/ui/SearchBar";
import { Spinner } from "@/components/ui/Spinner";
import { useActiveCohort } from "@/features/cohorts/hooks/useActiveCohort";
import {
  SessionHistoryService,
  sessionHistoryKeys,
} from "../services/sessionHistoryService";
import { safeRecordingUrl, type SessionDetail } from "../types/session";
import { youTubeEmbedUrl } from "../utils/youtube";

function formatDuration(session: SessionDetail): string | null {
  if (!session.started_at || !session.ended_at) return null;
  const mins = Math.round(
    (new Date(session.ended_at).getTime() -
      new Date(session.started_at).getTime()) /
      60_000,
  );
  if (!Number.isFinite(mins) || mins <= 0) return null;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return hrs > 0 ? `${hrs}h ${rem}m` : `${mins}m`;
}

export default function SessionPlayerPage() {
  const { sessionId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { activeCohort, isLoading: cohortLoading } = useActiveCohort();
  const [playlistQuery, setPlaylistQuery] = useState("");

  const requestedCohortId = Number(params.get("cohort"));
  const cohortId =
    Number.isSafeInteger(requestedCohortId) && requestedCohortId > 0
      ? requestedCohortId
      : activeCohort?.id ?? null;

  const sessionsQuery = useQuery({
    queryKey: cohortId ? sessionHistoryKeys.list(cohortId) : ["session-history", "none"],
    queryFn: () => SessionHistoryService.list(cohortId!),
    enabled: cohortId !== null,
  });

  const recordings = useMemo(() => {
    const list = sessionsQuery.data ?? [];
    return list
      .filter((s) => Boolean(safeRecordingUrl(s.recording_url)))
      .sort(
        (a, b) =>
          new Date(a.started_at ?? a.starts_at).getTime() -
          new Date(b.started_at ?? b.starts_at).getTime(),
      );
  }, [sessionsQuery.data]);

  const numericId = Number(sessionId);
  const currentIndex = recordings.findIndex((s) => s.id === numericId);
  const current =
    currentIndex >= 0
      ? recordings[currentIndex]
      : recordings.length > 0 && !sessionId
        ? recordings[0]
        : null;
  const resolvedIndex = current ? recordings.findIndex((s) => s.id === current.id) : -1;
  const prevSession = resolvedIndex > 0 ? recordings[resolvedIndex - 1] : null;
  const nextSession =
    resolvedIndex >= 0 && resolvedIndex < recordings.length - 1
      ? recordings[resolvedIndex + 1]
      : null;

  const filteredPlaylist = useMemo(() => {
    const q = playlistQuery.trim().toLowerCase();
    if (!q) return recordings;
    return recordings.filter((s) =>
      `${s.title} ${s.module_title} ${s.lesson_title ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [recordings, playlistQuery]);

  function openSession(id: number) {
    const suffix = cohortId ? `?cohort=${cohortId}` : "";
    navigate(`/sessions/${id}/watch${suffix}`);
  }

  if (cohortLoading || sessionsQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-body">
        <Spinner />
      </div>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-body">
        <ErrorState
          what="session recordings"
          error={sessionsQuery.error}
          onRetry={() => void sessionsQuery.refetch()}
        />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center text-body">
        <VideoOff size={32} className="text-muted" aria-hidden />
        <h1 className="text-xl font-semibold text-foreground">
          Recording not found
        </h1>
        <p className="max-w-md text-sm text-muted">
          This session recording is unavailable or hasn’t been published yet.
        </p>
        <ButtonLink to="/history">Back to Session History</ButtonLink>
      </div>
    );
  }

  const embedUrl = youTubeEmbedUrl(current.recording_url);
  const rawUrl = safeRecordingUrl(current.recording_url);
  const duration = formatDuration(current);
  const dateLabel = new Date(
    current.started_at ?? current.starts_at,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      {/* Slim theater top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href="/history"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-body transition-colors hover:bg-hover hover:text-foreground"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="hidden sm:inline">Session History</span>
          </a>
          <div className="min-w-0 truncate text-xs text-muted">
            <span className="font-semibold text-foreground">
              {current.cohort_name}
            </span>
            <span className="mx-1.5">·</span>
            <span>{current.module_title}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={!prevSession}
            onClick={() => prevSession && openSession(prevSession.id)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-xs font-semibold text-body transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            type="button"
            disabled={!nextSession}
            onClick={() => nextSession && openSession(nextSession.id)}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={15} aria-hidden />
          </button>
        </div>
      </header>

      {/* Main theater workspace */}
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left: Video stage + metadata */}
        <section className="min-w-0 space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-line bg-black shadow-lg">
            {embedUrl ? (
              <iframe
                key={current.id}
                src={embedUrl}
                title={current.title}
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : rawUrl ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <p className="text-sm text-slate-300">
                  This recording cannot be embedded directly.
                </p>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                >
                  Open video <ExternalLink size={15} aria-hidden />
                </a>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {current.module_title}
                </span>
                {current.lesson_title && (
                  <span className="text-xs text-muted">
                    {current.lesson_title}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                {current.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden />
                {dateLabel}
              </span>
              {duration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} aria-hidden />
                  {duration}
                </span>
              )}
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-body transition-colors hover:bg-hover hover:text-foreground"
                >
                  Open on YouTube <ExternalLink size={13} aria-hidden />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Right: Cohort recordings playlist */}
        <aside className="flex min-h-0 flex-col rounded-xl border border-line bg-surface lg:max-h-[calc(100vh-6.5rem)]">
          <div className="space-y-3 border-b border-line p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Cohort Recordings
              </h2>
              <span className="rounded-full bg-hover px-2 py-0.5 font-mono text-xs text-muted">
                {recordings.length}
              </span>
            </div>
            <SearchBar
              value={playlistQuery}
              onChange={setPlaylistQuery}
              placeholder="Search recordings…"
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {filteredPlaylist.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">
                No matching recordings.
              </p>
            ) : (
              filteredPlaylist.map((item) => {
                const isActive = item.id === current.id;
                const itemDate = new Date(
                  item.started_at ?? item.starts_at,
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const itemDuration = formatDuration(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openSession(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isActive
                        ? "border-accent bg-accent/10"
                        : "border-line bg-input/50 hover:border-line-strong hover:bg-hover"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-accent text-on-accent"
                          : "bg-surface text-muted"
                      }`}
                    >
                      <Play size={14} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium text-muted">
                          {item.module_title}
                        </span>
                        {isActive && (
                          <span className="shrink-0 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            Playing
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 line-clamp-2 text-sm leading-snug ${
                          isActive
                            ? "font-semibold text-foreground"
                            : "font-medium text-body"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {itemDate}
                        {itemDuration ? ` · ${itemDuration}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
