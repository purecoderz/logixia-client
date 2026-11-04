import { useQuery } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";

/** One course, for the edit form. Does nothing without an id. */
export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ""),
    queryFn: () => CourseService.getCourse(courseId ?? ""),
    enabled: Boolean(courseId),
    refetchOnWindowFocus: false, // the form keeps its own copy while you edit
  });
}