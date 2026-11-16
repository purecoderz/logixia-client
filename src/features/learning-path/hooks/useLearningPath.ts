import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useActiveCohort } from "@/features/cohorts/hooks/useActiveCohort";
import { LearningPathService } from "../services/learningPathService";
import type {
  CourseBreakdown,
  LearningPathCourse,
  PathStep,
} from "../types";

export function isTaskDone(status: string): boolean {
  return status === "completed";
}

function flattenSteps(course: LearningPathCourse): PathStep[] {
  const steps: PathStep[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      steps.push({
        key: `lesson-${lesson.id}`,
        kind: "lesson",
        moduleId: mod.id,
        moduleTitle: mod.title,
        lesson,
        title: lesson.title,
      });
      for (const task of lesson.tasks) {
        steps.push({
          key: `task-${task.id}`,
          kind: "task",
          taskKind: task.type,
          moduleId: mod.id,
          moduleTitle: mod.title,
          lessonId: lesson.id,
          task,
          title: task.title,
        });
      }
    }
  }
  return steps;
}

export function useLearningPath() {
  const { profile } = useAuth();
  const { activeCohort, isPending: cohortPending } = useActiveCohort(
    Boolean(profile),
  );
  const cohortId = activeCohort?.id ?? null;

  const courseQuery = useQuery({
    queryKey: ["learning-path", "cohort", cohortId],
    queryFn: () =>
      LearningPathService.getCohortCourse(cohortId!, activeCohort?.name),
    enabled: Boolean(cohortId),
    staleTime: 60_000,
  });

  const computed = useMemo(() => {
    const course = courseQuery.data;
    if (!course) {
      return {
        steps: [] as PathStep[],
        breakdown: {
          lessons: { done: 0, total: 0 },
          codeTasks: { done: 0, total: 0 },
          quizzes: { done: 0, total: 0 },
          totalSteps: 0,
          completedSteps: 0,
          percent: 0,
        } satisfies CourseBreakdown,
        nextStep: null as PathStep | null,
        activeModuleId: null as number | null,
      };
    }

    const steps = flattenSteps(course);
    let lessonsDone = 0;
    let lessonsTotal = 0;
    let codeDone = 0;
    let codeTotal = 0;
    let quizDone = 0;
    let quizTotal = 0;

    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        lessonsTotal += 1;
        if (lesson.is_completed) lessonsDone += 1;

        for (const task of lesson.tasks) {
          const done = isTaskDone(task.status);
          if (task.type === "code") {
            codeTotal += 1;
            if (done) codeDone += 1;
          } else {
            quizTotal += 1;
            if (done) quizDone += 1;
          }
        }
      }
    }

    const totalSteps = lessonsTotal + codeTotal + quizTotal;
    const completedSteps = lessonsDone + codeDone + quizDone;
    const percent =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const nextStep =
      steps.find((step) =>
        step.kind === "lesson"
          ? !step.lesson.is_locked && !step.lesson.is_completed
          : !step.task.is_locked && !isTaskDone(step.task.status),
      ) ?? null;

    const firstUnlockedIncompleteModule = course.modules.find(
      (mod) => !mod.is_locked && !mod.is_completed,
    );
    const activeModuleId =
      nextStep?.moduleId ??
      firstUnlockedIncompleteModule?.id ??
      course.modules[0]?.id ??
      null;

    return {
      steps,
      breakdown: {
        lessons: { done: lessonsDone, total: lessonsTotal },
        codeTasks: { done: codeDone, total: codeTotal },
        quizzes: { done: quizDone, total: quizTotal },
        totalSteps,
        completedSteps,
        percent,
      } satisfies CourseBreakdown,
      nextStep,
      activeModuleId,
    };
  }, [courseQuery.data]);

  return {
    activeCohort,
    cohortId,
    course: courseQuery.data ?? null,
    isLoading: cohortPending || (Boolean(cohortId) && courseQuery.isPending),
    error: courseQuery.error ?? null,
    refetch: courseQuery.refetch,
    ...computed,
  };
}
