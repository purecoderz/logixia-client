export type TaskKind = "quiz" | "code";

export interface OutlineTask {
  id: number;
  title: string;
  type: TaskKind;
  order: number;
}

export interface OutlineLesson {
  id: number;
  title: string;
  order: number;
  hasContent: boolean;
  tasks: OutlineTask[];
}

export interface OutlineModule {
  id: number;
  title: string;
  order: number;
  lessons: OutlineLesson[];
}

/** One thing that stops the course being sold, and where to fix it. */
export interface OutlineIssue {
  message: string;
  target: { kind: "course" } | { kind: "module"; id: number } | { kind: "lesson"; id: number };
}

export interface CourseOutline {
  id: number;
  title: string;
  isPublished: boolean;
  modules: OutlineModule[];
  issues: OutlineIssue[];
}