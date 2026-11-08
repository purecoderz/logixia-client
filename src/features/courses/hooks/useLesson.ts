import { useQuery } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.lesson(lessonId ?? ""),
    queryFn: () => CourseService.getLesson(lessonId ?? ""),
    enabled: Boolean(lessonId),
    // The editor keeps its own copy while you type, so a refetch behind it would only waste a request
    refetchOnWindowFocus: false,
  });
}
