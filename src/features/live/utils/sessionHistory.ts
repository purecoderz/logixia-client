import type {
  SessionHistoryEntry,
  SessionHistoryFilter,
} from "../types/sessionHistory";

export function matchesHistoryFilter(
  session: SessionHistoryEntry,
  filter: SessionHistoryFilter,
) {
  if (filter === "all") return true;
  if (filter === "not-recorded") return session.attendance === null;
  return session.attendance?.status === filter;
}

export function groupHistoryByModule(sessions: SessionHistoryEntry[]) {
  const groups = new Map<
    number,
    { title: string; sessions: SessionHistoryEntry[] }
  >();
  for (const session of sessions) {
    const group = groups.get(session.module_id) ?? {
      title: session.module_title,
      sessions: [],
    };
    group.sessions.push(session);
    groups.set(session.module_id, group);
  }
  return [...groups.entries()].map(([id, group]) => ({ id, ...group }));
}

export function sessionDuration(session: SessionHistoryEntry) {
  if (!session.started_at || !session.ended_at) return null;
  const minutes = Math.max(
    0,
    Math.round(
      (Date.parse(session.ended_at) - Date.parse(session.started_at)) / 60_000,
    ),
  );
  if (!Number.isFinite(minutes)) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}m` : ""}` : `${rest}m`;
}
