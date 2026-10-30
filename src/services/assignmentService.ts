import { apiFetch } from "../lib/http";

// What the API returns
export type SubmissionStatus = "in_progress" | "submitted" | "completed";

export interface RawAssignment {
  id: number;
  title: string;
  type: string;
  start_date: string;
  due_date: string;
  xp: number;
  status: SubmissionStatus | null;
}

// What the UI uses
export type AssignmentStatus = "active" | "done" | "missed" | "incomplete";

export interface Assignment extends RawAssignment {
  uiStatus: AssignmentStatus;
}

export function getUiStatus(a: RawAssignment, now = Date.now()): AssignmentStatus {
  if (a.status === "completed") return "done";

  const expired = new Date(a.due_date).getTime() < now;
  if (!expired) return "active"; // null, in_progress or submitted, still before the deadline

  // expired and not completed
  return a.status === null ? "missed" : "incomplete"; // in_progress or submitted
}

export const AssignmentService = {
  getAssignments: async (): Promise<Assignment[]> => {
    const id = localStorage.getItem("activeCohortId");
    const cohortId = id ? JSON.parse(id) : null;

    if (!cohortId) {
      throw new Error("You need to join a cohort in order to view assignments");
    }

    const response = await apiFetch(`/cohorts/${cohortId}/assignments`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail ?? "Failed to load assignments");
    }

    const raw: RawAssignment[] = await response.json();
    const now = Date.now();
    return raw.map((a) => ({ ...a, uiStatus: getUiStatus(a, now) }));
  },

  submit: async (
    assignmentId: string,
    files: Record<string, string>,
  ): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600)); // replace with a real POST later
    console.log("submit", assignmentId, files);
  },
};