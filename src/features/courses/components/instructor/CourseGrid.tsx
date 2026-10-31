import type { InstructorCourse } from "../../types/types";
import { InstructorCourseCard } from "./InstructorCourseCard";

interface CourseGridProps {
  courses: InstructorCourse[];
  onPublish: (course: InstructorCourse) => void;
  onCreateCohort: (course: InstructorCourse) => void;
  onOpenMenu: (course: InstructorCourse) => void;
}

export function CourseGrid({ courses, ...actions }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-gray-800 bg-gray-800/30 px-5 py-12 text-center text-sm text-gray-400">
        No courses match your filters.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => (
        <InstructorCourseCard key={c.id} course={c} {...actions} />
      ))}
    </div>
  );
}
