import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type {
  CohortMember,
  CreatedInvitation,
  CreateInvitationInput,
} from "../types/membership";

const membersPath = (cohortId: string) =>
  `/cohorts/${encodeURIComponent(cohortId)}/members`;

export const MembershipService = {
  async list(cohortId: string): Promise<CohortMember[]> {
    const response = await apiFetch(membersPath(cohortId));
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },

  async updateRole(
    cohortId: string,
    membershipId: number,
    role: "student" | "ta",
  ): Promise<void> {
    const response = await apiFetch(
      `${membersPath(cohortId)}/${membershipId}/role`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
  },

  async invite(
    cohortId: string,
    input: CreateInvitationInput,
  ): Promise<CreatedInvitation> {
    const response = await apiFetch(
      `/cohorts/${encodeURIComponent(cohortId)}/invitations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    const body: { invitation_url: string; expires_at: string } =
      await response.json();
    if (
      !body.invitation_url ||
      !body.expires_at ||
      !Number.isFinite(Date.parse(body.expires_at))
    ) {
      throw new Error("Invalid invitation response");
    }
    return { url: body.invitation_url, expiresAt: body.expires_at };
  },
};
