import type { InstructorCourse, InstructorCourseStatus } from "../types/types";

// GET /courses (the instructor's own, flat rows)
export interface RawInstructorCourse {
  id: number;
  title: string;
  slug: string;
  language: string;
  price: number | null;
  is_published: boolean;
  is_archived: boolean;
  updated_at: string;
  lessons: number;
  cohorts: number;
  students: number;
}

// Names that a simple "capitalise the first letter" gets wrong
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  php: "PHP",
};

export function formatLanguage(name: string): string {
  const key = name.trim().toLowerCase();
  return LANGUAGE_NAMES[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function statusOf(raw: RawInstructorCourse): InstructorCourseStatus {
  if (raw.is_archived) return "archived";
  return raw.is_published ? "published" : "draft";
}

export function toInstructorCourse(raw: RawInstructorCourse): InstructorCourse {
  return {
    id: String(raw.id),
    title: raw.title,
    slug: raw.slug,
    language: formatLanguage(raw.language),
    status: statusOf(raw),
    price: raw.price,
    lessons: raw.lessons,
    cohorts: raw.cohorts,
    students: raw.students,
    updatedAt: raw.updated_at,
  };
}