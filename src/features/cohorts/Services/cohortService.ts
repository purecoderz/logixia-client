import type { Cohort } from "../../../components/Cohorts/CohortCard";

import { CohortUtils } from "../utils/Cohorts";
import { apiFetch } from "../../../lib/http";
import type { InstructorCohort, InstructorCohortStatus } from "../types/types";

// Types
export type CohortStatus =
  | "open"
  | "starting-soon"
  | "in-progress"
  | "completed";

export interface RawCohort {
  id: number;
  name: string;
  course_id: number;
  instructor_id: string;
  start_date: string;
  end_date: string;
  price: number;
  subtitle?: string;
  seats_taken?: number;
  seats?: number; // what the API actually sends
  seats_total?: number; // legacy fallback
}

// GET /instructor/cohorts
export interface RawInstructorCohort {
  id: number;
  name: string;
  course_id: number;
  course_title: string;
  start_date: string;
  end_date: string;
  price: number;
  seats: number;
  seats_taken: number;
  is_published: boolean;
  status: InstructorCohortStatus;
}

// Used by the topbar cohort switcher
export interface CohortOption {
  id: number;
  name: string;
}

async function handleError(response: Response): Promise<never> {
  const error = await response.json().catch(() => null);
  const message =
    typeof error === "string" ? error : error?.detail ?? "Request failed";
  throw new Error(typeof message === "string" ? message : JSON.stringify(message));
}

// Cohort API Service
export const CohortService = {
  async getCohorts(path: string = "/cohorts"): Promise<Cohort[]> {
    const response = await apiFetch(path);
    if (!response.ok) return handleError(response);

    const rawData: RawCohort[] | RawCohort = await response.json();
    return Array.isArray(rawData)
      ? rawData.map((item) => CohortUtils.transform(item))
      : [CohortUtils.transform(rawData)];
  },

  // TODO: change the path if your instructor route is named differently
  async getInstructorCohorts(path: string = "/instructor/cohorts"): Promise<InstructorCohort[]> {
    const response = await apiFetch(path);
    if (!response.ok) return handleError(response);

    const raw: RawInstructorCohort[] = await response.json();
    return raw.map((item) => CohortUtils.transformForInstructor(item));
  },

  async getCohortsDetails(id: string): Promise<Cohort[]> {
    const response = await apiFetch(`/cohorts/${id}`);
    if (!response.ok) return handleError(response);
    return response.json();
  },

  async getMine(): Promise<CohortOption[]> {
    const response = await apiFetch("/user/cohorts");
    if (!response.ok) return handleError(response);
    return response.json();
  },
};