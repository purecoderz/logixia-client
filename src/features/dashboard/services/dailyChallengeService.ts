import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";
import type { ChallengeDifficulty } from "./dailyChallengeStore";

export interface DailyChallengeChoice {
  id: string;
  text: string;
}

export interface BackendDailyChallenge {
  id: number;
  challenge_date: string;
  difficulty: ChallengeDifficulty;
  challenge_type: "quiz" | "code";
  category: string;
  title: string;
  prompt: string;
  choices?: DailyChallengeChoice[] | null;
  correct_choice_id?: string | null;
  starter_files?: Record<string, string> | null;
  tests?: unknown;
  explanation?: string | null;
  xp: number;
  completed?: boolean;
  selected_choice_id?: string | null;
}

export interface DailyChallengeSubmitPayload {
  challenge_id: number;
  selected_choice_id?: string;
  student_code?: Record<string, string>;
}

export interface DailyChallengeSubmitResult {
  is_correct: boolean;
  correct_choice_id?: string | null;
  explanation?: string | null;
  xp_earned: number;
  current_streak: number;
  longest_streak: number;
}

export interface DailyChallengeActivityDay {
  date: string;
  is_correct: boolean;
  xp_earned: number;
}

export interface DailyChallengeActivityResponse {
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
  activity: DailyChallengeActivityDay[];
}

export const dailyChallengeKeys = {
  all: ["daily-challenge"] as const,
  today: (difficulty: ChallengeDifficulty) =>
    [...dailyChallengeKeys.all, "today", difficulty] as const,
  activity: (weeks: number) =>
    [...dailyChallengeKeys.all, "activity", weeks] as const,
};

export const DailyChallengeService = {
  async getToday(
    difficulty: ChallengeDifficulty,
  ): Promise<BackendDailyChallenge | null> {
    const response = await apiFetch(
      `/daily-challenge/today?difficulty=${encodeURIComponent(difficulty)}`,
    );
    // Fall back to local store while backend endpoint is not yet deployed.
    if (response.status === 404) return null;
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },

  async submit(
    payload: DailyChallengeSubmitPayload,
  ): Promise<DailyChallengeSubmitResult | null> {
    const response = await apiFetch("/daily-challenge/today/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },

  async getActivity(
    weeks = 24,
  ): Promise<DailyChallengeActivityResponse | null> {
    const response = await apiFetch(`/daily-challenge/activity?weeks=${weeks}`);
    if (response.status === 404) return null;
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};

export function useTodayDailyChallenge(difficulty: ChallengeDifficulty) {
  return useQuery({
    queryKey: dailyChallengeKeys.today(difficulty),
    queryFn: () => DailyChallengeService.getToday(difficulty),
    staleTime: 60_000,
  });
}

export function useSubmitDailyChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DailyChallengeSubmitPayload) =>
      DailyChallengeService.submit(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dailyChallengeKeys.all }),
  });
}

export function useDailyChallengeActivity(weeks = 24) {
  return useQuery({
    queryKey: dailyChallengeKeys.activity(weeks),
    queryFn: () => DailyChallengeService.getActivity(weeks),
    staleTime: 60_000,
  });
}
