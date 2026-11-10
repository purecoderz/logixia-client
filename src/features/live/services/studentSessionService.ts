import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type { SessionDetail } from "../types/session";

export const studentSessionKeys = {
  list: (cohortId: number) => ["live-sessions", "student", cohortId] as const,
};
export const StudentSessionService = {
  async list(cohortId: number): Promise<SessionDetail[]> {
    const response = await apiFetch(`/cohorts/${cohortId}/sessions`);
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
