import { useQuery } from "@tanstack/react-query";
import { CohortService } from "../services/cohortService";

// One place for query keys, so invalidation later is `invalidateQueries({ queryKey: cohortKeys.all })`
export const cohortKeys = {
  all: ["cohorts"] as const,
  instructor: () => [...cohortKeys.all, "instructor"] as const,
};

/** Cohorts owned by the logged-in instructor. */
export function useInstructorCohorts() {
  return useQuery({
    queryKey: cohortKeys.instructor(),
    queryFn: () => CohortService.getInstructorCohorts(),
    staleTime: 60_000, // statuses depend on today's date, so don't cache for long
  });
}