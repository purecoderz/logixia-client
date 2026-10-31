import { Button } from "../../../../components/ui/Button";
import type { InstructorCourse } from "../../types/types";

interface CourseActionsProps {
  course: InstructorCourse;
  onPublish: (course: InstructorCourse) => void;
  onCreateCohort: (course: InstructorCourse) => void;
  onOpenMenu: (course: InstructorCourse) => void;
}

export function CourseActions({ course: c, onPublish, onCreateCohort, onOpenMenu }: CourseActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {c.status === "draft" && <Button onClick={() => onPublish(c)}>Publish</Button>}
      {c.status === "published" && (
        <Button variant="ghost" onClick={() => onCreateCohort(c)}>
          Create cohort
        </Button>
      )}
      <Button variant="ghost" size="icon" aria-label={`More actions for ${c.title}`} onClick={() => onOpenMenu(c)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </Button>
    </div>
  );
}
