import { useQuery } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";

export function useCourseOutline(courseId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.outline(courseId ?? ""),
    queryFn: () => CourseService.getOutline(courseId ?? ""),
    enabled: Boolean(courseId),
  });
}