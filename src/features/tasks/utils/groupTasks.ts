import type { CourseOutline, TaskKind } from "@/features/courses/types/outline";
import type { TaskGroup } from "../types";

export interface TaskQuery {
  moduleId: "all" | number;
  type: "" | TaskKind;
  q: string;
}

/** The tasks of the chosen module (or every module), straight from the outline we already loaded. */
export function groupTasks(
  outline: CourseOutline,
  query: TaskQuery,
): TaskGroup[] {
  const q = query.q.trim().toLowerCase();

  return outline.modules.flatMap((m, mi) => {
    if (query.moduleId !== "all" && m.id !== query.moduleId) return [];

    const rows = m.lessons.flatMap((l, li) =>
      l.tasks
        .filter(
          (t) =>
            (query.type === "" || t.type === query.type) &&
            (q === "" ||
              t.title.toLowerCase().includes(q) ||
              l.title.toLowerCase().includes(q)),
        )
        .map((t) => ({
          id: t.id,
          title: t.title,
          type: t.type,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonNumber: `${mi + 1}.${li + 1}`,
        })),
    );

    return [
      { moduleId: m.id, moduleNumber: mi + 1, moduleTitle: m.title, rows },
    ];
  });
}
