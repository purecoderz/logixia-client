import type { CreateCohortInput } from "../types/create";
import { courseKeys } from "@/features/courses/hooks/courseKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CohortService } from "../Services/cohortService";

export const cohortKeys = {
  all: ["cohorts"] as const,
  // Version the mapped shape: older cached rows did not include courseId.
  instructor: () => [...cohortKeys.all, "instructor", "v2"] as const,
  mine: () => [...cohortKeys.all, "mine"] as const,
};

/** Cohorts owned by the logged-in instructor. */
export function useInstructorCohorts(enabled = true) {
  return useQuery({
    enabled,
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
/** Refresh every cohort view after publication changes. */
export function useUpdateCohortPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      CohortService.updatePublication(id, isPublished),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cohortKeys.all }),
  });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCohortInput) => CohortService.create(input),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: cohortKeys.all }),
      queryClient.invalidateQueries({ queryKey: courseKeys.all }),
    ]),
  });
}

export function useUpdateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CreateCohortInput> }) => CohortService.update(id, patch),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: cohortKeys.all }),
      queryClient.invalidateQueries({ queryKey: courseKeys.all }),
    ]),
  });
}
