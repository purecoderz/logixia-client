import type { QuizQuestion } from "@/features/assignments/components/QuizeRender";
import type { TaskKind } from "@/features/courses/types/outline";

export type LearningPathTaskStatus =
  | "completed"
  | "submitted"
  | "in_progress"
  | "not_started"
  | string;

export interface LearningPathTask {
  id: number;
  title: string;
  type: TaskKind;
  order: number;
  status: LearningPathTaskStatus;
  is_locked: boolean;
}

export interface LearningPathLesson {
  id: number;
  title: string;
  order: number;
  has_content: boolean;
  is_locked: boolean;
  is_completed: boolean;
  completed_tasks: number;
  total_tasks: number;
  tasks: LearningPathTask[];
}

export interface LearningPathModule {
  id: number;
  title: string;
  order: number;
  is_locked: boolean;
  is_completed: boolean;
  completed_lessons: number;
  total_lessons: number;
  lessons: LearningPathLesson[];
}

export interface LearningPathCourse {
  title: string;
  modules: LearningPathModule[];
}

export type PathStep =
  | {
      key: string;
      kind: "lesson";
      moduleId: number;
      moduleTitle: string;
      lesson: LearningPathLesson;
      title: string;
    }
  | {
      key: string;
      kind: "task";
      taskKind: TaskKind;
      moduleId: number;
      moduleTitle: string;
      lessonId: number;
      task: LearningPathTask;
      title: string;
    };

export interface StudentLessonTask {
  id: number;
  title: string;
  type: TaskKind;
  order: number;
  instructions: string | null;
  starter_files: Record<string, string> | null;
  questions: QuizQuestion[];
  status: LearningPathTaskStatus;
  is_locked: boolean;
  student_code: Record<string, string> | null;
  selected_answers: Record<string, string> | null;
}

export interface StudentLessonDetail {
  id: number;
  module_id: number;
  title: string;
  order: number;
  content: string;
  is_completed: boolean;
  tasks: StudentLessonTask[];
}

export interface CourseBreakdown {
  lessons: { done: number; total: number };
  codeTasks: { done: number; total: number };
  quizzes: { done: number; total: number };
  totalSteps: number;
  completedSteps: number;
  percent: number;
}
