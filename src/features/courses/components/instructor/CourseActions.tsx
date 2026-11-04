import { useNavigate } from "react-router-dom";
import { ActionMenu, type MenuItem } from "../../../../components/ui/ActionMenu";
import { Button } from "../../../../components/ui/Button";
import { ButtonLink } from "../../../../components/ui/ButtonLink";
import { Spinner } from "../../../../components/ui/Spinner";
import type { InstructorCourse } from "../../types/types";
import { editCoursePath, newCohortPath } from "../../utils/paths";

export interface CourseHandlers {
  onPublish: (course: InstructorCourse) => void;
  onUnpublish: (course: InstructorCourse) => void;
  onArchive: (course: InstructorCourse) => void;
  onRestore: (course: InstructorCourse) => void;
}

interface CourseActionsProps {
  course: InstructorCourse;
  /** True while one of this course's actions is running. */
  busy: boolean;
  handlers: CourseHandlers;
}

/** The one button a course needs most, plus a menu for the rest. */
export function CourseActions({ course: c, busy, handlers }: CourseActionsProps) {
  const navigate = useNavigate();

  const edit: MenuItem = { label: "Edit details", onSelect: () => navigate(editCoursePath(c.id)) };
  const createCohort: MenuItem = { label: "Create cohort", onSelect: () => navigate(newCohortPath(c.id)) };
  const archive: MenuItem = { label: "Archive", onSelect: () => handlers.onArchive(c) };

  const menu: MenuItem[] =
    c.status === "draft"
      ? [edit, createCohort, archive]
      : c.status === "published"
        ? [edit, { label: "Unpublish", onSelect: () => handlers.onUnpublish(c) }, archive]
        : [{ label: "Restore", onSelect: () => handlers.onRestore(c) }];

  return (
    <div className="flex items-center gap-2">
      {c.status === "draft" && (
        <Button onClick={() => handlers.onPublish(c)} disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Spinner tone="dark" /> Publishing…
            </>
          ) : (
            "Publish"
          )}
        </Button>
      )}
      {c.status === "published" && <ButtonLink to={newCohortPath(c.id)} variant="ghost">Create cohort</ButtonLink>}
      <ActionMenu label={`More actions for ${c.title}`} items={menu} disabled={busy} />
    </div>
  );
}