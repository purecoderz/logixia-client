import { apiErrorFrom } from "../../../lib/apiError";
import { apiFetch } from "../../../lib/http";

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

export function getUiStatus(
  a: RawAssignment,
  now = Date.now(),
): AssignmentStatus {
  if (a.status === "completed") return "done";

  const expired = new Date(a.due_date).getTime() < now;
  if (!expired) return "active"; // null, in_progress or submitted, still before the deadline

  // expired and not completed
  return a.status === null ? "missed" : "incomplete"; // in_progress or submitted
}

export class NoCohortError extends Error {
  constructor() {
    super("You need to join a cohort in order to view tasks");
    this.name = "NoCohortError";
  }
}

export const AssignmentService = {
  getAssignments: async (selectedCohortId?: number): Promise<Assignment[]> => {
    const id = localStorage.getItem("activeCohortId");
    const cohortId = selectedCohortId ?? (id ? JSON.parse(id) : null);

    if (!cohortId) throw new NoCohortError();

    const response = await apiFetch(`/cohorts/${cohortId}/tasks`);

    if (!response.ok) throw await apiErrorFrom(response);

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

  getTask: async (id: string): Promise<AssignmentTask> => {
    const response = await apiFetch(`/cohort-tasks/${id}`);
    if (!response.ok) throw await apiErrorFrom(response);
    const data = await response.json();
    if (
      !data ||
      typeof data.title !== "string" ||
      typeof data.instructions !== "string" ||
      typeof data.due_date !== "string" ||
      !isFileMap(data.starter_files)
    )
      throw new Error("The task response is invalid.");
    return { ...data, xp: typeof data.xp === "number" ? data.xp : 0 };
  },
};

export interface AssignmentTask {
  id: number;
  title: string;
  instructions: string;
  due_date: string;
  xp: number;
  starter_files: Record<string, string>;
}

export function isFileMap(value: unknown): value is Record<string, string> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([path, content]) =>
        typeof content === "string" &&
        !!path &&
        !path.startsWith("/") &&
        !path.includes("\\") &&
        path
          .split("/")
          .every((part) => !!part && part !== "." && part !== ".."),
    )
  );
}




