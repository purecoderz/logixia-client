import type { CourseOutline, OutlineIssue, OutlineLesson, OutlineModule, TaskKind } from "../types/outline";

export interface RawOutlineModule {
  id: number;
  title: string;
  order: number;
  lessons: {
    id: number;
    title: string;
    order: number;
    has_content: boolean;
    tasks: { id: number; title: string; type: TaskKind; order: number }[];
  }[];
}

// The course outline: titles and counts only, already sorted by the server
export interface RawCourseOutline {
  id: number;
  title: string;
  is_published: boolean;
  modules: RawOutlineModule[];
  issues: { message: string; target_type: "course" | "module" | "lesson"; target_id: number | null }[];
}

function toIssue(raw: RawCourseOutline["issues"][number]): OutlineIssue {
  if (raw.target_type !== "course" && raw.target_id !== null) {
    return { message: raw.message, target: { kind: raw.target_type, id: raw.target_id } };
  }
  return { message: raw.message, target: { kind: "course" } };
}

// What the server returns right after creating a module
export interface RawCreatedModule {
  id: number;
  title: string;
  module_order: number;
}

// What the server returns right after creating a lesson (extra fields are ignored)
export interface RawCreatedLesson {
  id: number;
  title: string;
  lesson_order: number;
}

/** A lesson that was just created starts with no text and no tasks. */
export function toNewLesson(l: RawCreatedLesson): OutlineLesson {
  return { id: l.id, title: l.title, order: l.lesson_order, hasContent: false, tasks: [] };
}

/** A module that was just created has no lessons yet, so we don't need the server to say so. */
export function toNewModule(m: RawCreatedModule): OutlineModule {
  return { id: m.id, title: m.title, order: m.module_order, lessons: [] };
}

export function toOutlineModule(m: RawOutlineModule): OutlineModule {
  return {
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      hasContent: l.has_content,
      tasks: l.tasks,
    })),
  };
}

export function toCourseOutline(raw: RawCourseOutline): CourseOutline {
  return {
    id: raw.id,
    title: raw.title,
    isPublished: raw.is_published,
    modules: raw.modules.map(toOutlineModule),
    issues: raw.issues.map(toIssue),
  };
}