import { apiErrorFrom } from "../../../lib/apiError";
import { apiFetch } from "../../../lib/http";
import type { LessonDetail, LessonPatch } from "../types/lesson";
import type {
  CourseOutline,
  OutlineLesson,
  OutlineModule,
  OutlineTask,
  TaskKind,
} from "../types/outline";
import type { InstructorCourse } from "../types/types";
import {
  toCourseOutline,
  toNewLesson,
  toNewModule,
  toNewTask,
  type RawCourseOutline,
  type RawCreatedLesson,
  type RawCreatedModule,
  type RawCreatedTask,
} from "../utils/toCourseOutline";
import {
  toInstructorCourse,
  type RawInstructorCourse,
} from "../utils/toInstructorCourse";
import type {
  CourseFormErrors,
  CourseFormField,
  CourseFormValues,
  Language,
} from "../types/form";
import { parsePrice } from "../utils/priceInput";
import type { CoursePatch } from "../types/Patch";
import type { CourseForEdit } from "../types/course";

// POST /courses
export interface CreateCourseRequest {
  title: string;
  slug: string;
  description: string; // may be "" for a draft
  language_id: number;
  skills: string[];
  price: number | null; // whole naira. 0 = free, null = not sold on its own
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
export function toFieldErrors(
  status: number,
  body: unknown,
): CourseFormErrors | null {
  const detail = isRecord(body) ? body.detail : undefined;
  if (status !== 422 || !Array.isArray(detail)) return null;

  const errors: CourseFormErrors = {};
  for (const item of detail) {
    if (
      !isRecord(item) ||
      !Array.isArray(item.loc) ||
      typeof item.msg !== "string"
    )
      continue;
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
    price: parsePrice(v.price), // "" becomes null
  };
}

// TODO: set this to your real route for "the logged-in instructor's courses"
const INSTRUCTOR_COURSES_PATH = "/courses";

// TODO: set this to your real route for a course's outline
// TODO: and for changing one course (PATCH): publish, unpublish, archive, restore
const coursePath = (courseId: string) => `/courses/${courseId}`;
const outlinePath = (courseId: string) => `/courses/${courseId}/outline`;
// TODO: and for adding a module to a course
const modulesPath = (courseId: string) => `/courses/${courseId}/modules`;
// TODO: and for adding a lesson to a module
const lessonsPath = (moduleId: number) => `/modules/${moduleId}/lessons`;
// TODO: and for reading and saving one lesson (GET and PATCH)
const lessonDetailPath = (lessonId: string) => `/lessons/${lessonId}`;
const modulePath = (moduleId: number) => `/modules/${moduleId}`;
const moduleOrderPath = (courseId: string) =>
  `/courses/${courseId}/modules/order`;
const lessonOrderPath = (moduleId: number) =>
  `/modules/${moduleId}/lessons/order`;
// TODO: check this against your route
const tasksPath = (lessonId: number) => `/lessons/${lessonId}/tasks`;

async function send(
  path: string,
  method: "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<void> {
  const response = await apiFetch(path, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw await apiErrorFrom(response);
}

export const CourseService = {
  async getCourse(courseId: string): Promise<CourseForEdit> {
    const response = await apiFetch(coursePath(courseId));
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: {
      id: number;
      title: string;
      slug: string;
      description: string;
      language_id: number;
      skills: string[];
      price: number | null;
      is_published: boolean;
      is_archived: boolean;
    } = await response.json();
    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      languageId: raw.language_id,
      skills: raw.skills,
      price: raw.price,
      isPublished: raw.is_published,
      isArchived: raw.is_archived,
    };
  },

  async updateCourse(courseId: string, patch: CoursePatch): Promise<void> {
    const response = await apiFetch(coursePath(courseId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (response.ok) return;
    if (response.status === 422) {
      const fieldErrors = toFieldErrors(
        422,
        await response
          .clone()
          .json()
          .catch(() => null),
      );
      if (fieldErrors) throw new CourseFormRejected(fieldErrors);
    }
    throw await apiErrorFrom(response);
  },

  /** The server picks the position (last). Only a title and a type are sent. */
  async addTask(
    lessonId: number,
    title: string,
    type: TaskKind,
  ): Promise<OutlineTask> {
    const response = await apiFetch(tasksPath(lessonId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type }),
    });
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: RawCreatedTask = await response.json();
    return toNewTask(raw);
  },

  async getLesson(lessonId: string): Promise<LessonDetail> {
    const response = await apiFetch(lessonDetailPath(lessonId));
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: { id: number; title: string; content: string } =
      await response.json();
    return { id: raw.id, title: raw.title, content: raw.content };
  },

  /** Send only the fields that changed. */
  async updateLesson(lessonId: string, patch: LessonPatch): Promise<void> {
    const response = await apiFetch(lessonDetailPath(lessonId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },

  /** The server picks the position (last) and starts the lesson with no text. Only the title is sent. */
  async addLesson(moduleId: number, title: string): Promise<OutlineLesson> {
    const response = await apiFetch(lessonsPath(moduleId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: RawCreatedLesson = await response.json();
    return toNewLesson(raw);
  },

  /** The server picks the position (last). Only the title is sent. */
  async addModule(courseId: string, title: string): Promise<OutlineModule> {
    const response = await apiFetch(modulesPath(courseId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: RawCreatedModule = await response.json();
    return toNewModule(raw);
  },

  async getOutline(courseId: string): Promise<CourseOutline> {
    const response = await apiFetch(outlinePath(courseId));
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: RawCourseOutline = await response.json();
    return toCourseOutline(raw);
  },

  async getInstructorCourses(): Promise<InstructorCourse[]> {
    const response = await apiFetch(INSTRUCTOR_COURSES_PATH);
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: RawInstructorCourse[] = await response.json();
    return raw.map(toInstructorCourse);
  },

  async create(values: CourseFormValues): Promise<CreatedCourse> {
    const response = await apiFetch("/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRequest(values)),
    });

    if (response.ok) return response.json();

    // 422: Pydantic rejected specific fields. Anything else (400, 500...) is a general failure.
    if (response.status === 422) {
      const fieldErrors = toFieldErrors(
        422,
        await response
          .clone()
          .json()
          .catch(() => null),
      );
      if (fieldErrors) throw new CourseFormRejected(fieldErrors);
    }
    throw await apiErrorFrom(response);
  },

  renameModule: (moduleId: number, title: string) =>
    send(modulePath(moduleId), "PATCH", { title }),
  deleteModule: (moduleId: number) => send(modulePath(moduleId), "DELETE"),
  deleteLesson: (lessonId: number) =>
    send(lessonDetailPath(String(lessonId)), "DELETE"),
  reorderModules: (courseId: string, ids: number[]) =>
    send(moduleOrderPath(courseId), "PUT", { ids }),
  reorderLessons: (moduleId: number, ids: number[]) =>
    send(lessonOrderPath(moduleId), "PUT", { ids }),

  async getLanguages(): Promise<Language[]> {
    const response = await apiFetch("/languages");
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
