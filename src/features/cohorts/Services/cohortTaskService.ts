import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type {
  CohortTask,
  CohortTaskInput,
  CohortTaskPatch,
} from "../types/cohortTask";

export const cohortTaskKey = (cohortId: string) =>
  ["cohorts", "instructor", cohortId, "tasks"] as const;
export const CohortTaskService = {
  async list(cohortId: string): Promise<CohortTask[]> {
    const response = await apiFetch(`/instructor/cohorts/${cohortId}/tasks`);
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async assign(cohortId: string, tasks: CohortTaskInput[]): Promise<void> {
    const response = await apiFetch(`/cohorts/${cohortId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },
  async remove(id: number): Promise<void> {
    const response = await apiFetch(`/cohort-tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },
  async update(id: number, patch: CohortTaskPatch): Promise<void> {
    const response = await apiFetch(`/cohort-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },
};
