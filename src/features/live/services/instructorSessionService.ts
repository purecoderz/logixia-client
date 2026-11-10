import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type { SessionDetail, SessionInput } from "../types/session";

export const sessionKeys = {
  instructor: ["sessions", "instructor"] as const,
  list: (cohortId: string) => ["sessions", "instructor", cohortId] as const,
  detail: (id: number) => ["sessions", "detail", id] as const,
};
async function check(response: Response) { if (!response.ok) throw await apiErrorFrom(response); }
export const InstructorSessionService = {
  async list(cohortId: string): Promise<SessionDetail[]> {
    if (!/^\d+$/.test(cohortId) || Number(cohortId) <= 0) throw new Error("Choose a valid cohort before loading sessions.");
    const response = await apiFetch(`/instructor/sessions?cohort_id=${encodeURIComponent(cohortId)}`);
    await check(response); return response.json();
  },
  async get(id: number): Promise<SessionDetail> {
    const response = await apiFetch(`/instructor/sessions/${id}`);
    await check(response); return response.json();
  },
  async create(cohortId: string, input: SessionInput): Promise<void> {
    const response = await apiFetch(`/cohorts/${cohortId}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    await check(response);
  },
  async update(id: number, input: SessionInput): Promise<void> {
    const response = await apiFetch(`/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    await check(response);
  },
  async start(id: number): Promise<void> {
    const response = await apiFetch(`/sessions/${id}/start`, { method: "POST" }); await check(response);
  },
  async cancel(id: number): Promise<void> {
    const response = await apiFetch(`/sessions/${id}/cancel`, { method: "POST" }); await check(response);
  },
};
