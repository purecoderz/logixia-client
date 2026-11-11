import type { CreateCohortInput } from "../types/create";
import { apiErrorFrom } from "@/lib/apiError";

import { CohortUtils } from "../utils/Cohorts";
import { apiFetch } from "../../../lib/http";
import type {
  Cohort,
  InstructorCohort,
  InstructorCohortStatus,
} from "../types/types";

// Types
export type CohortStatus =
  "open" | "starting-soon" | "in-progress" | "completed";

export interface RawCohort {
  id: number;
  name: string;
  course_id: number;
  instructor_id: string;
  start_date: string;
  end_date: string;
  price: number;
  course_title?: string;
  subtitle?: string;
  seats_taken: number;
  seats: number;
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
  status?: InstructorCohortStatus | "starting_soon" | "in_progress" | null;
}

// Used by the topbar cohort switcher
export interface CohortOption {
  id: number;
  name: string;
}

async function handleError(response: Response): Promise<never> {
  throw await apiErrorFrom(response);
}

/**
 * Public catalog responses must represent persisted Cohort rows. The database
 * uses positive integer primary keys, so generated/demo records with UUID-like
 * ids must not leak into student pages.
 */
function isPersistedCohort(item: RawCohort): boolean {
  return Number.isInteger(item.id) && item.id > 0;
}

// Cohort API Service
export const CohortService = {
  async update(id: string, patch: Partial<CreateCohortInput>): Promise<void> {
    const response = await apiFetch(`/cohorts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return handleError(response);
  },

  async create(input: CreateCohortInput): Promise<void> {
    const response = await apiFetch("/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) return handleError(response);
  },

  async updatePublication(id: string, isPublished: boolean): Promise<void> {
    const response = await apiFetch(`/cohorts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: isPublished }),
    });
    if (!response.ok) return handleError(response);
  },

  async getCohorts(path: string = "/public/cohorts"): Promise<Cohort[]> {
    const response = await apiFetch(path);
    if (!response.ok) return handleError(response);

    const rawData: RawCohort[] | RawCohort = await response.json();
    const items = Array.isArray(rawData) ? rawData : [rawData];

    return items
      .filter(isPersistedCohort)
      .map((item) => CohortUtils.transform(item));
  },

  async getInstructorCohorts(
    path: string = "/instructor/cohorts",
  ): Promise<InstructorCohort[]> {
    const response = await apiFetch(path);
    if (!response.ok) return handleError(response);

    const raw: RawInstructorCohort[] = await response.json();
    return raw.map((item) => CohortUtils.transformForInstructor(item));
  },

  async getCohortsDetails(id: string): Promise<Cohort[]> {
    const response = await apiFetch(`/public/cohorts/${id}`);
    if (!response.ok) return handleError(response);
    return response.json();
  },

  async getMine(): Promise<CohortOption[]> {
    const response = await apiFetch("/user/cohorts");
    if (!response.ok) return handleError(response);
    return response.json();
  },
};
