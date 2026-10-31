import { apiFetch } from "../../../lib/http";
import type { CourseFormErrors, CourseFormField, CourseFormValues, Language } from "../types/form";
import { parsePrice } from "../utils/priceInput";

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
 * Turns an error response into per-field messages, or null if it isn't about a field.
 *  - 409: { detail: { field: "title", message: "..." } }   (duplicate title or slug)
 *  - 422: FastAPI's standard validation list ({ detail: [{ loc: [..., "title"], msg }] })
 */
export function toFieldErrors(status: number, body: unknown): CourseFormErrors | null {
  const detail = isRecord(body) ? body.detail : undefined;

  if (status === 409 && isRecord(detail)) {
    const field = typeof detail.field === "string" ? FIELD_MAP[detail.field] : undefined;
    if (field && typeof detail.message === "string") return { [field]: detail.message };
  }

  if (status === 422 && Array.isArray(detail)) {
    const errors: CourseFormErrors = {};
    for (const item of detail) {
      if (!isRecord(item) || !Array.isArray(item.loc) || typeof item.msg !== "string") continue;
      const key = item.loc[item.loc.length - 1];
      const field = typeof key === "string" ? FIELD_MAP[key] : undefined;
      if (field && !errors[field]) errors[field] = item.msg;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  return null;
}

function messageFrom(body: unknown): string {
  const detail = isRecord(body) ? body.detail : undefined;
  return typeof detail === "string" ? detail : "Couldn't save the course. Please try again.";
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

    const body: unknown = await response.json().catch(() => null);
    const fieldErrors = toFieldErrors(response.status, body);
    if (fieldErrors) throw new CourseFormRejected(fieldErrors);
    throw new Error(messageFrom(body));
  },

  async getLanguages(): Promise<Language[]> {
    const response = await apiFetch("/languages");
    if (!response.ok) throw new Error("Couldn't load the languages.");
    return response.json();
  },
};