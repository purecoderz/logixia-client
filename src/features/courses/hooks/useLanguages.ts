import { useQuery } from "@tanstack/react-query";
import { CourseService } from "../services/courseService";
import { courseKeys } from "./courseKeys";

export function useLanguages() {
  return useQuery({
    queryKey: courseKeys.languages(),
    queryFn: () => CourseService.getLanguages(),
    staleTime: 10 * 60_000, // the list rarely changes
  });
}