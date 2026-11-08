import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";
import type { CoursePatch } from "../types/Patch";

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      patch,
    }: {
      courseId: string;
      patch: CoursePatch;
    }) => CourseService.updateCourse(courseId, patch),
    // Returned, so the button keeps spinning until the list has the new status
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courseKeys.all }),
  });
}
