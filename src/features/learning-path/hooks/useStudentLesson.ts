import { useQuery } from "@tanstack/react-query";
import { LearningPathService } from "../services/learningPathService";

export function useStudentLesson(
  cohortId: number | null,
  lessonId: number | null,
) {
  return useQuery({
    queryKey: ["learning-path", "cohort", cohortId, "lesson", lessonId],
    queryFn: () => LearningPathService.getCohortLesson(cohortId!, lessonId!),
    enabled: Boolean(cohortId && lessonId),
    staleTime: 30_000,
  });
}
