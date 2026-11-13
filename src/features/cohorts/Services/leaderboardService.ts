import { useQuery } from "@tanstack/react-query";
import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";

export interface CohortLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_xp: number;
  current_streak: number;
}

export const cohortLeaderboardKeys = {
  all: ["cohort-leaderboard"] as const,
  byCohort: (cohortId: number) =>
    [...cohortLeaderboardKeys.all, cohortId] as const,
};

export const CohortLeaderboardService = {
  async list(cohortId: number): Promise<CohortLeaderboardEntry[]> {
    const response = await apiFetch(`/cohorts/${cohortId}/leaderboard`);
    if (!response.ok) throw await apiErrorFrom(response);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },
};

export function useCohortLeaderboard(cohortId: number | null) {
  return useQuery({
    queryKey: cohortLeaderboardKeys.byCohort(cohortId ?? 0),
    queryFn: () => CohortLeaderboardService.list(cohortId!),
    enabled: cohortId !== null && cohortId > 0,
    staleTime: 60_000,
  });
}
