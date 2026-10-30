import { useQuery } from "@tanstack/react-query";
import { CohortService } from "../Services/cohortService";

export const cohortKeys = {
  all: ["cohorts"] as const,
  instructor: () => [...cohortKeys.all, "instructor"] as const,
  mine: () => [...cohortKeys.all, "mine"] as const,
};

/** Cohorts owned by the logged-in instructor. */
export function useInstructorCohorts() {
  return useQuery({
    queryKey: cohortKeys.instructor(),
    queryFn: () => CohortService.getInstructorCohorts(),
    staleTime: 60_000,
  });
}

/** Cohorts the logged-in student belongs to (topbar switcher). */
export function useMyCohorts() {
  return useQuery({
    queryKey: cohortKeys.mine(),
    queryFn: CohortService.getMine,
    staleTime: 60_000,
  });
}