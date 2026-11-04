import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "@/features/courses/services/courseService";
import { courseKeys } from "./courseKeys";

/** Every change the outline can make. Each one refreshes the course data when it succeeds. */
export function useOutlineActions() {
  const queryClient = useQueryClient();
  // Returned, so the caller waits until the page shows the new state
  const refresh = () => queryClient.invalidateQueries({ queryKey: courseKeys.all });

  return {
    renameModule: useMutation({
      mutationFn: (v: { id: number; title: string }) => CourseService.renameModule(v.id, v.title),
      onSuccess: refresh,
    }),
    renameLesson: useMutation({
      mutationFn: (v: { id: number; title: string }) => CourseService.updateLesson(String(v.id), { title: v.title }),
      onSuccess: refresh,
    }),
    deleteModule: useMutation({ mutationFn: (id: number) => CourseService.deleteModule(id), onSuccess: refresh }),
    deleteLesson: useMutation({ mutationFn: (id: number) => CourseService.deleteLesson(id), onSuccess: refresh }),
    reorderModules: useMutation({
      mutationFn: (v: { courseId: string; ids: number[] }) => CourseService.reorderModules(v.courseId, v.ids),
      onSuccess: refresh,
    }),
    reorderLessons: useMutation({
      mutationFn: (v: { moduleId: number; ids: number[] }) => CourseService.reorderLessons(v.moduleId, v.ids),
      onSuccess: refresh,
    }),
  };
}