import type { Cohort } from "../components/Cohorts/CohortCard";
import { CohortUtils } from "../utils/Cohorts";

const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/cohorts`;

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
  seats_total?: number;
}

// Used by the topbar cohort switcher
export interface CohortOption {
  id: number;
  name: string;
}

export interface MyCohorts {
  items: CohortOption[];
  activeCohortId: number | null;
}

async function handleError(response: Response): Promise<never> {
  const error = await response.json().catch(() => "Request failed");
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
}

// Cohort API Service
export const CohortService = {
  async getCohorts(endpoint: string = API_URL): Promise<Cohort[]> {
    const response = await fetch(endpoint);

    if (!response.ok) return handleError(response);

    const rawData: RawCohort[] | RawCohort = await response.json();

    if (Array.isArray(rawData)) {
      return rawData.map((item) => CohortUtils.transform(item));
    }

    return [CohortUtils.transform(rawData)];
  },

  async getCohortsDetails(id: string): Promise<Cohort[]> {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) return handleError(response);

    return response.json();
  },

  async getMine(): Promise<CohortOption[]> {
    const response = await fetch(`${BASE_URL}/me/cohorts`, {
      credentials: "include",
    });

    if (!response.ok) return handleError(response);

    return response.json();
  },

};