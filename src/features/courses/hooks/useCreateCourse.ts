import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseFormValues } from "../types/form";
import { courseKeys } from "./courseKeys";
import { CourseService } from "../services/courseService";

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CourseFormValues) => CourseService.create(values),
    // The new course must show up on the courses list
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseKeys.all }),
  });
}