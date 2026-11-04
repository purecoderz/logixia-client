import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import type { LessonDetail, LessonPatch } from "../types/lesson";
import { courseKeys } from "./courseKeys";


export function useUpdateLesson(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: LessonPatch) => CourseService.updateLesson(lessonId, patch),
    onSuccess: (_result, patch) => {
      // Keep the cached lesson current, so coming back to it shows what you wrote
      queryClient.setQueryData<LessonDetail>(courseKeys.lesson(lessonId), (old) => (old ? { ...old, ...patch } : old));
      // The outline shows the title and the "No content" tag
      void queryClient.invalidateQueries({ queryKey: courseKeys.outline(courseId) });
    },
  });
}
