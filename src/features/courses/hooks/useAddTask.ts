import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "@/features/courses/services/courseService";
import type { CourseOutline, TaskKind } from "@/features/courses/types/outline";
import { courseKeys } from "./courseKeys";

export function useAddTask(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      title,
      type,
    }: {
      lessonId: number;
      title: string;
      type: TaskKind;
    }) => CourseService.addTask(lessonId, title, type),
    onSuccess: (task, { lessonId }) => {
      // Show the new task straight away, inside its lesson...
      queryClient.setQueryData<CourseOutline>(
        courseKeys.outline(courseId),
        (old) =>
          old
            ? {
                ...old,
                modules: old.modules.map((m) => ({
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, tasks: [...l.tasks, task] } : l,
                  ),
                })),
              }
            : old,
      );
      // ...then refresh in the background, so the checklist and the tasks page catch up
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
