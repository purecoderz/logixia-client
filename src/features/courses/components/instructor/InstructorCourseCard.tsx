import { formatPrice } from "../../utils/formatPrice";
import { formatUpdated } from "../../utils/formatUpdated";
import type { InstructorCourse } from "../../types/types";
import { CourseActions } from "./CourseActions";
import { CourseStatusChip } from "./CourseStatusChip";

interface InstructorCourseCardProps {
  course: InstructorCourse;
  onPublish: (course: InstructorCourse) => void;
  onCreateCohort: (course: InstructorCourse) => void;
  onOpenMenu: (course: InstructorCourse) => void;
}

export function InstructorCourseCard({ course: c, ...actions }: InstructorCourseCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-800/30 p-5 hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Swap for your router's <Link> */}
          <a href={`/instructor/courses/${c.id}`} className="break-words font-semibold text-gray-50 hover:text-sky-300 hover:underline">
            {c.title}
          </a>
          <p className="mt-0.5 text-xs text-gray-400">
            {c.language} · {formatPrice(c.price)}
          </p>
        </div>
        <CourseStatusChip status={c.status} />
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        {[
          ["Lessons", c.lessons],
          ["Cohorts", c.cohorts],
          ["Students", c.students],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="font-semibold text-gray-100">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-400">Updated {formatUpdated(c.updatedAt)}</p>
        <CourseActions course={c} {...actions} />
      </div>
    </article>
  );
}