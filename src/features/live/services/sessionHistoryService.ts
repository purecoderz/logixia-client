import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";
import type { SessionHistoryEntry } from "../types/sessionHistory";

export const sessionHistoryKeys = {
  list: (cohortId: number) => ["session-history", cohortId] as const,
};

export const SessionHistoryService = {
  async list(cohortId: number): Promise<SessionHistoryEntry[]> {
    const response = await apiFetch(`/cohorts/${cohortId}/sessions/history`);
    if (!response.ok) throw await apiErrorFrom(response);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("The session history response is invalid.");
    return data as SessionHistoryEntry[];
  },
};
