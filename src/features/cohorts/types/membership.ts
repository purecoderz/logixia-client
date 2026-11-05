export type CohortMemberRole = "student" | "ta" | "instructor";
export type InvitationAccess = "owing" | "waived";

export interface CohortMember {
  id: number;
  user_id: string;
  username: string;
  email: string;
  role: CohortMemberRole;
  payment_status: string;
  total_xp: number;
}

export interface CreateInvitationInput {
  email: string;
  access: InvitationAccess;
}

/** Invitation response mapped into the UI model by MembershipService. */
export interface CreatedInvitation {
  url: string;
  expiresAt: string;
}
