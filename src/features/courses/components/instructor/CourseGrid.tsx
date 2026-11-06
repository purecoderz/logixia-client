import type { InstructorCourse } from "../../types/types";
import type { CourseHandlers } from "./CourseActions";
import { InstructorCourseCard } from "./InstructorCourseCard";

interface CourseGridProps {
  courses: InstructorCourse[];
  busyId: string | null;
  handlers: CourseHandlers;
}

export function CourseGrid({ courses, busyId, handlers }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface-muted/30 px-5 py-12 text-center text-sm text-muted">
        No courses match your filters.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => (
        <InstructorCourseCard key={c.id} course={c} busy={busyId === c.id} handlers={handlers} />
      ))}
    </div>
  );
}