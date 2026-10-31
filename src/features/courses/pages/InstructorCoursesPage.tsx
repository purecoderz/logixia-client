import { InstructorCoursesView } from "../components/instructor/InstructorCoursesView";
import { mockCourses } from "../mockCourses";

// TODO: swap mockCourses for useInstructorCourses() once the endpoint exists
export default function InstructorCoursesPage() {
  return <InstructorCoursesView courses={mockCourses} />;
}
