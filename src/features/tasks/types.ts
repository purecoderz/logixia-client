import type { TaskKind } from "@/features/courses/types/outline";

export interface TaskRow {
  id: number;
  title: string;
  type: TaskKind;
  lessonId: number;
  lessonTitle: string;
  lessonNumber: string; // "2.3", the position in the list, so a deleted module never leaves a gap
}

export interface TaskGroup {
  moduleId: number;
  moduleNumber: number;
  moduleTitle: string;
  rows: TaskRow[];
}