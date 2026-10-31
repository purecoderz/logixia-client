import { apiErrorFrom } from "../../../lib/apiError";
import { apiFetch } from "../../../lib/http";
import type { CourseFormErrors, CourseFormField, CourseFormValues, Language } from "../types/form";
import { parsePrice } from "../utils/priceInput";

// POST /courses
export interface CreateCourseRequest {
  title: string;
  slug: string;
  description: string; // may be "" for a draft
  language_id: number;
  skills: string[];
  price: number; // whole naira, 0 = free
}

export interface CreatedCourse {
  id: number;
  slug: string;
  title: string;
}

/** Thrown when the server rejects specific fields, so the form can show them in place. */
export class CourseFormRejected extends Error {
  readonly errors: CourseFormErrors;
  constructor(errors: CourseFormErrors) {
    super("The server rejected the course.");
    this.errors = errors;
  }
}

const FIELD_MAP: Record<string, CourseFormField> = {
  title: "title",
  slug: "slug",
  description: "description",
  language_id: "languageId",
  skills: "skills",
  price: "price",
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * FastAPI/Pydantic validation errors (status 422) -> per-field messages.
 * Returns null when the response isn't a field problem.
 * Expected shape: { detail: [{ loc: [..., "title"], msg: "..." }] }
 */
export function toFieldErrors(status: number, body: unknown): CourseFormErrors | null {
  const detail = isRecord(body) ? body.detail : undefined;
  if (status !== 422 || !Array.isArray(detail)) return null;

  const errors: CourseFormErrors = {};
  for (const item of detail) {
    if (!isRecord(item) || !Array.isArray(item.loc) || typeof item.msg !== "string") continue;
    const key = item.loc[item.loc.length - 1];
    const field = typeof key === "string" ? FIELD_MAP[key] : undefined;
    if (field && !errors[field]) errors[field] = item.msg;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export function toRequest(v: CourseFormValues): CreateCourseRequest {
  return {
    title: v.title.trim(),
    slug: v.slug,
    description: v.description.trim(),
    language_id: Number(v.languageId),
    skills: v.skills,
    price: parsePrice(v.price) ?? 0,
  };
}


export const CourseService = {
  async create(values: CourseFormValues): Promise<CreatedCourse> {
    const response = await apiFetch("/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRequest(values)),
    });

    if (response.ok) return response.json();

    // 422: Pydantic rejected specific fields. Anything else (400, 500...) is a general failure.
    if (response.status === 422) {
      const fieldErrors = toFieldErrors(422, await response.clone().json().catch(() => null));
      if (fieldErrors) throw new CourseFormRejected(fieldErrors);
    }
    throw await apiErrorFrom(response);
  },

  async getLanguages(): Promise<Language[]> {
    const response = await apiFetch("/languages");
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};