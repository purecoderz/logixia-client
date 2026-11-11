import { useQuery } from "@tanstack/react-query";
import {
  SessionHistoryService,
  sessionHistoryKeys,
} from "../services/sessionHistoryService";

export function useSessionHistory(cohortId: number) {
  return useQuery({
    queryKey: sessionHistoryKeys.list(cohortId),
    queryFn: () => SessionHistoryService.list(cohortId),
    staleTime: 5 * 60_000,
  });
}
