import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MembershipService } from "../Services/membershipService";
import { cohortKeys } from "./useCohorts";
import { courseKeys } from "@/features/courses/hooks/courseKeys";
import type { CreateInvitationInput } from "../types/membership";

export const membersKey = (cohortId: string) =>
  [...cohortKeys.all, cohortId, "members"] as const;

export function useMembers(cohortId: string) {
  return useQuery({
    queryKey: membersKey(cohortId),
    queryFn: () => MembershipService.list(cohortId),
    enabled: Boolean(cohortId),
  });
}

export function useChangeMemberRole(cohortId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      role,
    }: {
      membershipId: number;
      role: "student" | "ta";
    }) => MembershipService.updateRole(cohortId, membershipId, role),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: cohortKeys.all }),
        client.invalidateQueries({ queryKey: courseKeys.all }),
      ]),
  });
}

export function useInviteStudent(cohortId: string) {
  return useMutation({
    mutationFn: (input: CreateInvitationInput) =>
      MembershipService.invite(cohortId, input),
  });
}
