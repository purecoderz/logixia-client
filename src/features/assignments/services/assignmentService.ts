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

export function quizSubmissionAnswers(
  answers: Record<string, string>,
): Record<string, string> {
  // Return answers as-is: { "q1": "q1-c", "q2": "q2-b", ... }
  return { ...answers };
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

  submitQuiz: async (
    assignmentId: string,
    answers: Record<string, string>,
  ): Promise<void> => {
    const submissionAnswers = quizSubmissionAnswers(answers);
    const response = await apiFetch(
      `/cohort-tasks/${assignmentId}/quiz/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionAnswers),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
  },

  practiceRun: async (
    assignmentId: string,
    files: Record<string, string>,
  ): Promise<void> => {
    const response = await apiFetch(`/tasks/${assignmentId}/practice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },

  getTask: async (id: string): Promise<AssignmentTask> => {
    const response = await apiFetch(`/cohort-tasks/${id}`);
    if (!response.ok) throw await apiErrorFrom(response);
    const data = await response.json();
    if (
      !data ||
      typeof data.title !== "string" ||
      typeof data.instructions !== "string"
    )
      throw new Error("The task response is invalid.");

    const type = data.type === "quiz" ? "quiz" : "code";
    const due_date = typeof data.due_date === "string" ? data.due_date : "";
    const xp = typeof data.xp === "number" ? data.xp : 0;
    const status = typeof data.status === "string" ? data.status : null;

    if (type === "quiz") {
      if (!Array.isArray(data.questions)) {
        throw new Error("The quiz response is invalid.");
      }
      return {
        ...data,
        type: "quiz",
        due_date,
        xp,
        status,
      };
    }

    if (!isFileMap(data.starter_files)) {
      throw new Error("The task response is invalid.");
    }
    return {
      ...data,
      type: "code",
      due_date,
      xp,
      status,
    };
  },
};

export interface AssignmentCodeTask {
  id: number;
  title: string;
  type: "code";
  instructions: string;
  due_date: string;
  xp: number;
  status?: string | null;
  student_code?: unknown;
  starter_files: Record<string, string>;
}

export interface AssignmentQuizQuestion {
  id: string;
  prompt: string;
  choices: { id: string; text: string }[];
  correct_choice_id?: string;
  explanation?: string;
}

export interface AssignmentQuizTask {
  id: number;
  title: string;
  type: "quiz";
  instructions: string;
  due_date: string;
  xp: number;
  status?: string | null;
  student_code?: unknown;
  questions: AssignmentQuizQuestion[];
}

export type AssignmentTask = AssignmentCodeTask | AssignmentQuizTask;

async function requireSuccess(response: Response) {
  if (!response.ok) throw await apiErrorFrom(response);
}

export const AssignmentDraftService = {
  async getTask(id: string): Promise<AssignmentTask> {
    return AssignmentService.getTask(id);
  },
  async getDraft(id: string): Promise<Record<string, string> | null> {
    const response = await apiFetch(`/tasks/${id}/draft`);
    if (response.status === 204) return null;
    await requireSuccess(response);
    const data = await response.json();
    if (!isFileMap(data?.files))
      throw new Error("The saved draft response is invalid.");
    return data.files;
  },
  async saveDraft(id: string, files: Record<string, string>): Promise<void> {
    const response = await apiFetch(`/tasks/${id}/draft`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
    await requireSuccess(response);
  },
};

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




