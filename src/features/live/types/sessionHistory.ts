import type { SessionDetail } from "./session";

export type AttendanceStatus = "present" | "absent";
export type RecordingStatus = "ready" | "processing" | "unavailable";

export interface SessionAttendance {
  status: AttendanceStatus;
  taken_at: string;
  joined_at: string | null;
}

/** Student-safe history row. It contains only the signed-in student's attendance. */
export interface SessionHistoryEntry extends SessionDetail {
  instructor_name: string | null;
  recording_status: RecordingStatus;
  attendance: SessionAttendance | null;
}

export type SessionHistoryFilter =
  | "all"
  | "present"
  | "absent"
  | "not-recorded";
