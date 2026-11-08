import { useActiveCohort } from "../../cohorts/hooks/useActiveCohort";
import { describeError } from "../../../lib/apiError";
import { useQuery } from "@tanstack/react-query";
import {
  AssignmentService,
  NoCohortError,
} from "../services/assignmentService";

export const ASSIGNMENTS_KEY = ["my-assignments"] as const;

export function useAssignments() {
  const { activeCohort } = useActiveCohort();
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, activeCohort?.id ?? null],
    enabled: !!activeCohort,
    queryFn: () => AssignmentService.getAssignments(activeCohort!.id),
    retry: (count, error) =>
      !(error instanceof NoCohortError) &&
      describeError(error, "tasks").retryable &&
      count < 2,
  });
}
