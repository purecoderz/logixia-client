import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import type { CourseOutline } from "../types/outline";
import { courseKeys } from "./courseKeys";

export function useAddLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, title }: { moduleId: number; title: string }) =>
      CourseService.addLesson(moduleId, title),
    onSuccess: (lesson, { moduleId }) => {
      // Show the new lesson straight away, in its module...
      queryClient.setQueryData<CourseOutline>(
        courseKeys.outline(courseId),
        (old) =>
          old
            ? {
                ...old,
                modules: old.modules.map((m) =>
                  m.id === moduleId
                    ? { ...m, lessons: [...m.lessons, lesson] }
                    : m,
                ),
              }
            : old,
      );
      // ...then refresh in the background so the checklist catches up
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
