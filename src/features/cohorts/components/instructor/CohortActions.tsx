import { useNavigate } from "react-router-dom";
import type { InstructorCohort } from "../../types/types";
import { Button } from "@/components/ui/Button";
import { ActionMenu, type MenuItem } from "@/components/ui/ActionMenu";
import { Spinner } from "@/components/ui/Spinner";

export interface CohortActionProps {
  busyId: string | null;
  onCopyLink: (cohort: InstructorCohort) => void;
  onPublish: (cohort: InstructorCohort) => void;
  onUnpublish: (cohort: InstructorCohort) => void;
}

export function CohortActions({ cohort: c, busyId, onCopyLink, onPublish, onUnpublish }: CohortActionProps & { cohort: InstructorCohort }) {
  const navigate = useNavigate();
  const busy = busyId === c.id;
  const disabled = busyId !== null;
  const edit: MenuItem = { label: "Edit details", onSelect: () => navigate(`/instructor/cohorts/${c.id}/edit`) };
  const members: MenuItem = { label: "Manage members", onSelect: () => navigate(`/instructor/cohorts/members?cohort=${encodeURIComponent(c.id)}`) };
  const items: MenuItem[] = c.status === "draft"
    ? [edit, members, { label: "Publish", onSelect: () => onPublish(c) }]
    : [
        edit,
        members,
        { label: "View details", onSelect: () => navigate(`/cohort/${c.id}`) },
        { label: "Copy link", onSelect: () => onCopyLink(c) },
        { label: "Unpublish", onSelect: () => onUnpublish(c) },
      ];

  return (
    <div className="flex items-center gap-2">
      {c.status === "draft" && (
        <Button onClick={() => onPublish(c)} disabled={disabled} aria-busy={busy}>
          {busy ? <><Spinner tone="dark" /> Publishing…</> : "Publish"}
        </Button>
      )}
      {(c.status === "open" || c.status === "starting-soon") && (
        <Button variant="ghost" onClick={() => onCopyLink(c)} disabled={disabled}>Copy link</Button>
      )}
      {busy && c.status !== "draft" && <span role="status" className="text-sm text-gray-400"><Spinner /> Updating…</span>}
      <ActionMenu label={`More actions for ${c.name}`} items={items} disabled={disabled} />
    </div>
  );
}
