import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type { InvitationAccess } from "../types/membership";

export interface InvitationPreview {
  cohort_id: number;
  cohort_name: string;
  course_title: string;
  email: string;
  access: InvitationAccess;
  expires_at: string;
}

export interface AcceptedInvitation {
  cohort_id: number;
  membership_id: number;
}

export const InvitationService = {
  async preview(token: string): Promise<InvitationPreview> {
    const response = await apiFetch(
      `/invitations/preview?${new URLSearchParams({ token })}`,
      { cache: "no-store", referrerPolicy: "no-referrer" },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    const body: InvitationPreview = await response.json();
    if (
      !body.cohort_name ||
      !body.email ||
      !["owing", "waived"].includes(body.access) ||
      !Number.isFinite(Date.parse(body.expires_at))
    ) {
      throw new Error("Invalid invitation preview");
    }
    return body;
  },
  async accept(token: string): Promise<AcceptedInvitation> {
    const response = await apiFetch("/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
