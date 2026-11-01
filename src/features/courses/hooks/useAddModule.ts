import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import type { CourseOutline } from "../types/outline";
import { courseKeys } from "./courseKeys";

export function useAddModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => CourseService.addModule(courseId, title),
    onSuccess: (module) => {
      // Show the new module straight away...
      queryClient.setQueryData<CourseOutline>(courseKeys.outline(courseId), (old) =>
        old ? { ...old, modules: [...old.modules, module] } : old,
      );
      // ...then refresh in the background, so the checklist ("Module 3 has no lessons") catches up
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}