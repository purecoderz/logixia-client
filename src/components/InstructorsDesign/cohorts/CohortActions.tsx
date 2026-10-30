import type { InstructorCohort } from "../../../types/cohort";
import { Button } from "../../ui/Button";


interface CohortActionsProps {
  cohort: InstructorCohort;
  onCopyLink: (cohort: InstructorCohort) => void;
  onPublish: (cohort: InstructorCohort) => void;
  onOpenMenu: (cohort: InstructorCohort) => void;
}

export function CohortActions({ cohort: c, onCopyLink, onPublish, onOpenMenu }: CohortActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {c.status === "draft" && <Button onClick={() => onPublish(c)}>Publish</Button>}
      {(c.status === "open" || c.status === "starting-soon") && (
        <Button variant="ghost" onClick={() => onCopyLink(c)}>
          Copy link
        </Button>
      )}
      <Button variant="ghost" size="icon" aria-label={`More actions for ${c.name}`} onClick={() => onOpenMenu(c)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </Button>
    </div>
  );
}