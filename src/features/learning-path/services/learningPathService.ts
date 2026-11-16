import type { QuizSubmitResult } from "@/features/assignments/components/QuizeRender";
import type { SubmissionResult } from "@/features/assignments/services/assignmentService";
import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";
import type {
  LearningPathCourse,
  LearningPathLesson,
  LearningPathModule,
  LearningPathTask,
  StudentLessonDetail,
  StudentLessonTask,
} from "../types";

type RawCourseResponse =
  | LearningPathModule[]
  | {
      title?: string;
      course_title?: string;
      modules?: LearningPathModule[];
    };

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeTask(task: LearningPathTask): LearningPathTask {
  return {
    ...task,
    is_locked: Boolean(task.is_locked),
    status: task.status ?? "not_started",
  };
}

function normalizeLesson(lesson: LearningPathLesson): LearningPathLesson {
  const tasks = sortByOrder(Array.isArray(lesson.tasks) ? lesson.tasks : []).map(
    normalizeTask,
  );
  return {
    ...lesson,
    has_content: Boolean(lesson.has_content),
    is_locked: Boolean(lesson.is_locked),
    is_completed: Boolean(lesson.is_completed),
    completed_tasks: Number(lesson.completed_tasks ?? 0),
    total_tasks: Number(lesson.total_tasks ?? tasks.length),
    tasks,
  };
}

function normalizeModule(mod: LearningPathModule): LearningPathModule {
  const lessons = sortByOrder(Array.isArray(mod.lessons) ? mod.lessons : []).map(
    normalizeLesson,
  );
  return {
    ...mod,
    is_locked: Boolean(mod.is_locked),
    is_completed: Boolean(mod.is_completed),
    completed_lessons: Number(mod.completed_lessons ?? 0),
    total_lessons: Number(mod.total_lessons ?? lessons.length),
    lessons,
  };
}

export const LearningPathService = {
  async getCohortCourse(
    cohortId: number | string,
    fallbackTitle = "Learning Path",
  ): Promise<LearningPathCourse> {
    const response = await apiFetch(
      `/student/cohorts/${encodeURIComponent(String(cohortId))}/course`,
    );
    if (!response.ok) throw await apiErrorFrom(response);

    const raw: RawCourseResponse = await response.json();
    const rawModules = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.modules)
        ? raw.modules
        : [];
    const title = Array.isArray(raw)
      ? fallbackTitle
      : raw?.course_title?.trim() || raw?.title?.trim() || fallbackTitle;

    return {
      title,
      modules: sortByOrder(rawModules).map(normalizeModule),
    };
  },

  async getCohortLesson(
    cohortId: number | string,
    lessonId: number | string,
  ): Promise<StudentLessonDetail> {
    const response = await apiFetch(
      `/student/cohorts/${encodeURIComponent(String(cohortId))}/lessons/${encodeURIComponent(String(lessonId))}`,
    );
    if (!response.ok) throw await apiErrorFrom(response);

    const raw = (await response.json()) as Partial<StudentLessonDetail>;
    const tasks = sortByOrder(
      Array.isArray(raw.tasks) ? raw.tasks : [],
    ).map(
      (task): StudentLessonTask => ({
        ...task,
        is_locked: Boolean(task.is_locked),
        status: task.status ?? "not_started",
        instructions: task.instructions ?? null,
        starter_files: task.starter_files ?? null,
        questions: Array.isArray(task.questions) ? task.questions : [],
        student_code: task.student_code ?? null,
        selected_answers: task.selected_answers ?? null,
      }),
    );

    return {
      id: Number(raw.id),
      module_id: Number(raw.module_id),
      title: raw.title ?? "",
      order: Number(raw.order ?? 0),
      content: raw.content ?? "",
      is_completed: Boolean(raw.is_completed),
      tasks,
    };
  },

  async submitCodeTask(
    cohortId: number | string,
    taskId: number | string,
    files: Record<string, string>,
  ): Promise<SubmissionResult> {
    const response = await apiFetch(
      `/student/cohorts/${encodeURIComponent(String(cohortId))}/tasks/${encodeURIComponent(String(taskId))}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json() as Promise<SubmissionResult>;
  },

  async submitQuizTask(
    cohortId: number | string,
    taskId: number | string,
    answers: Record<string, string>,
  ): Promise<QuizSubmitResult | undefined> {
    const response = await apiFetch(
      `/student/cohorts/${encodeURIComponent(String(cohortId))}/tasks/${encodeURIComponent(String(taskId))}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json().catch(() => undefined);
  },
};
