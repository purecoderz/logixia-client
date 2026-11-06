import { DataTable, type Column } from "@/components/ui/DataTable";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Spinner } from "@/components/ui/Spinner";
import { StatusChip } from "@/components/ui/StatusChip";
import type { CohortMember } from "../../types/membership";

interface Props {
  members: CohortMember[];
  busyId: number | null;
  onRoleChange: (member: CohortMember, role: "student" | "ta") => void;
  filtered?: boolean;
}

export function MembersTable({ members, busyId, onRoleChange, filtered = false }: Props) {
  const columns: Column<CohortMember>[] = [
    { header: "Member", cell: (m) => <div><p className="font-semibold text-foreground">{m.username}</p><p className="mt-1 text-xs text-muted">{m.email}</p></div> },
    { header: "Role", cell: (m) => <StatusChip tone={m.role === "instructor" ? "info" : "neutral"}>{m.role === "ta" ? "Teaching assistant" : m.role === "instructor" ? "Instructor" : "Student"}</StatusChip> },
    { header: "Payment", cell: (m) => <span className="capitalize">{m.payment_status.replaceAll("_", " ")}</span> },
    { header: "Total XP", cell: (m) => m.total_xp.toLocaleString() },
    { header: "Actions", hideHeader: true, cell: (m) => m.role === "instructor" ? <span className="text-xs text-muted">Protected role</span> : (
      <div className="flex items-center justify-end gap-2">
        {busyId === m.id && <span role="status"><Spinner /><span className="sr-only">Updating role…</span></span>}
        <ActionMenu label={`Change role for ${m.username}`} disabled={busyId !== null} items={[
          { label: m.role === "student" ? "Make teaching assistant" : "Make student", onSelect: () => onRoleChange(m, m.role === "student" ? "ta" : "student") },
        ]} />
      </div>
    ) },
  ];
  return <DataTable columns={columns} rows={members} getRowKey={(m) => String(m.id)} emptyMessage={filtered ? "No members match your filters." : "No members have joined this cohort yet. Invite a student to get started."} />;
}
