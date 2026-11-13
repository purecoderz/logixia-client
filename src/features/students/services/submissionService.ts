import { useQuery } from "@tanstack/react-query";
import type { SubmissionStatus } from "@/features/assignments/services/assignmentService";
import { ApiError, apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";

/**
 * One student's submission row for a cohort task (matches backend `Submission` model).
 * Backend contract: GET /instructor/cohorts/{cohort_id}/submissions
 */
export interface CohortSubmission {
  cohort_task_id: number;
  user_id: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  xp_earned: number | null;
  collated?: boolean;
}

/** `null` means the backend does not expose submissions yet (404). */
export type SubmissionsResult = CohortSubmission[] | null;

export const cohortSubmissionsKey = (cohortId: string) =>
  ["cohorts", "instructor", cohortId, "submissions"] as const;

export const SubmissionService = {
  async list(cohortId: string): Promise<SubmissionsResult> {
    const response = await apiFetch(
      `/instructor/cohorts/${encodeURIComponent(cohortId)}/submissions`,
    );
    if (response.status === 404) return null;
    if (!response.ok) throw await apiErrorFrom(response);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new ApiError("Invalid submissions response");
    return data as CohortSubmission[];
  },
};

export function useCohortSubmissions(cohortId: string) {
  return useQuery({
    queryKey: cohortSubmissionsKey(cohortId),
    queryFn: () => SubmissionService.list(cohortId),
    enabled: Boolean(cohortId),
    staleTime: 30_000,
  });
}

export interface AttemptStatus {
  submitted: boolean;
  passed: boolean;
}

/** Index submissions by `taskId:userId`, derived from `Submission.status`. */
export function indexAttempts(
  submissions: CohortSubmission[],
): Map<string, AttemptStatus> {
  const map = new Map<string, AttemptStatus>();
  for (const s of submissions) {
    const key = `${s.cohort_task_id}:${String(s.user_id)}`;
    const passed = s.status === "completed";
    const submitted = passed || s.status === "submitted";
    map.set(key, { submitted, passed });
  }
  return map;
}

export const attemptKey = (taskId: number, userId: string) =>
  `${taskId}:${userId}`;
