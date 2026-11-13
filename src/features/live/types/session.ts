export type SessionStatus = "scheduled" | "live" | "ended" | "cancelled";
export interface CohortSession {
  id: number;
  cohort_id: number;
  cohort_name: string;
  module_id: number;
  module_title: string;
  lesson_id: number | null;
  lesson_title: string | null;
  title: string;
  instructor_id: string | null;
  notes: string | null;
  starts_at: string;
  started_at: string | null;
  ended_at: string | null;
  status: SessionStatus;
  recording_url: string | null;
}
export interface SessionDetail extends CohortSession {
  lesson: { id: number; title: string; content: string } | null;
  instructor_codes: Record<string, string> | null;
}
export interface SessionInput {
  title: string;
  module_id: number;
  lesson_id: number | null;
  notes: string | null;
  starts_at: string;
  recording_url?: string | null;
}
export interface SessionFields { title: string; moduleId: string; lessonId: string; notes: string; startsAt: string; recordingUrl?: string }
export function validateSession(fields: SessionFields): string | null {
  if (!fields.title.trim() || fields.title.trim().length > 200) return "Enter a session title between 1 and 200 characters.";
  if (!fields.moduleId) return "Choose a module or create one first.";
  if (!fields.lessonId && !fields.notes.trim()) return "Attach a lesson or write teaching notes for this session.";
  if (!fields.startsAt || !Number.isFinite(new Date(fields.startsAt).getTime())) return "Choose a valid start date and time.";
  if (fields.recordingUrl?.trim() && !safeRecordingUrl(fields.recordingUrl)) return "Enter a valid http(s) recording link (e.g. YouTube URL).";
  return null;
}
export function sessionPayload(fields: SessionFields, includeRecording = false): SessionInput {
  const payload: SessionInput = { title: fields.title.trim(), module_id: Number(fields.moduleId), lesson_id: fields.lessonId ? Number(fields.lessonId) : null, notes: fields.notes.trim() || null, starts_at: new Date(fields.startsAt).toISOString() };
  if (includeRecording) payload.recording_url = safeRecordingUrl(fields.recordingUrl ?? null) ?? null;
  return payload;
}
export function safeRecordingUrl(value: string | null) {
  if (!value) return null;
  const cleaned = value.trim().replace(/^["']+|["']+$/g, "");
  try { const url = new URL(cleaned); return url.protocol === "https:" || url.protocol === "http:" ? url.href : null; } catch { return null; }
}
export const sessionRoomPath = (id: number) => `/live/room/${id}`;
