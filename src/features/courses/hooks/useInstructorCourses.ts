import { useQuery } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";

/** The logged-in instructor's courses, including drafts and archived ones. */
export function useInstructorCourses() {
  return useQuery({
    queryKey: courseKeys.instructor(),
    queryFn: () => CourseService.getInstructorCourses(),
  });
}
