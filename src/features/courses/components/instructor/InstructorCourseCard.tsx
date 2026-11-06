import { Link } from "react-router-dom";
import type { InstructorCourse } from "../../types/types";
import { formatPrice } from "../../utils/formatPrice";
import { formatUpdated } from "../../utils/formatUpdated";
import { CourseActions, type CourseHandlers } from "./CourseActions";
import { CourseStatusChip } from "./CourseStatusChip";
import { builderPath } from "../../utils/paths";

interface InstructorCourseCardProps {
  course: InstructorCourse;
  busy: boolean;
  handlers: CourseHandlers;
}

export function InstructorCourseCard({ course: c, busy, handlers }: InstructorCourseCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface-muted/30 p-5 hover:border-line">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={builderPath(c.id)} className="break-words font-semibold text-foreground hover:text-accent hover:underline">
            {c.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            {c.language} · {formatPrice(c.price)}
          </p>
        </div>
        <CourseStatusChip status={c.status} />
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        {(
          [
            ["Lessons", c.lessons],
            ["Cohorts", c.cohorts],
            ["Students", c.students],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-muted">Updated {formatUpdated(c.updatedAt)}</p>
        <CourseActions course={c} busy={busy} handlers={handlers} />
      </div>
    </article>
  );
}