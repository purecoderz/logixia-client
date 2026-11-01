import type { CourseOutline, OutlineIssue, TaskKind } from "../types/outline";

// GET the course outline: titles and counts only, already sorted by the server
export interface RawCourseOutline {
  id: number;
  title: string;
  is_published: boolean;
  modules: {
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
  }[];
  issues: { message: string; target_type: "course" | "module" | "lesson"; target_id: number | null }[];
}

function toIssue(raw: RawCourseOutline["issues"][number]): OutlineIssue {
  if (raw.target_type !== "course" && raw.target_id !== null) {
    return { message: raw.message, target: { kind: raw.target_type, id: raw.target_id } };
  }
  return { message: raw.message, target: { kind: "course" } };
}

export function toCourseOutline(raw: RawCourseOutline): CourseOutline {
  return {
    id: raw.id,
    title: raw.title,
    isPublished: raw.is_published,
    modules: raw.modules.map((m) => ({
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
    })),
    issues: raw.issues.map(toIssue),
  };
}