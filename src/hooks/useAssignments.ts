import { useQuery } from "@tanstack/react-query";
import { AssignmentService } from "../services/assignmentService";

export const ASSIGNMENTS_KEY = ["my-assignments"] as const;


export function useAssignments() {
  return useQuery({
    queryKey: ASSIGNMENTS_KEY,
    queryFn: AssignmentService.getAssignments,
  });
}