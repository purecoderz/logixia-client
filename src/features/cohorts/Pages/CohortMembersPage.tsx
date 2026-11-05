import { Select } from "@/components/ui/Select";
import { Users } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { Field, fieldProps } from "@/components/ui/Field";
import { inputClass } from "@/components/ui/formStyles";
import { StatCard } from "@/components/ui/StatCard";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { ActionNotice, type Notice } from "@/features/courses/components/instructor/ActionNotice";
import { useInstructorCohorts } from "../hooks/useCohorts";
import { useMembers, useChangeMemberRole, useInviteStudent } from "../hooks/useMemberships";
import { InvitationForm } from "../components/instructor/InvitationForm";
import { MembersTable } from "../components/instructor/MembersTable";
import type { CohortMember, CohortMemberRole } from "../types/membership";

type RoleFilter = "all" | CohortMemberRole;

export default function CohortMembersPage() {
  const { cohortId: routeId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cohorts = useInstructorCohorts();
  if (cohorts.isPending) return <ListPageSkeleton label="Loading your cohorts" />;
  if (cohorts.isError) return <ErrorState what="your cohorts" error={cohorts.error} onRetry={() => void cohorts.refetch()} />;
  if (cohorts.data.length === 0) return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-800/30 p-6">
      <h1 className="text-2xl font-semibold text-gray-50">Manage students</h1>
      <p className="text-sm text-gray-400">Create a cohort first, then invite students and manage their roles here.</p>
      <ButtonLink to="/instructor/cohorts/new">Create cohort</ButtonLink>
    </div>
  );
  const cohortId = routeId ?? params.get("cohort") ?? cohorts.data[0].id;
  const selected = cohorts.data.some((c) => c.id === cohortId);
  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <Field label="Cohort" htmlFor="members-cohort" hint="Choose a cohort to view its members and invite students.">
          <Select {...fieldProps("members-cohort", undefined, true)} value={selected ? cohortId : ""} onChange={(value) => navigate(`/instructor/cohorts/members?cohort=${encodeURIComponent(value)}`)} placeholder="Select a cohort" searchable searchPlaceholder="Search cohorts…" icon={<Users size={18} />} options={cohorts.data.map((c) => ({ value: c.id, label: c.name, description: c.course }))} />
        </Field>
      </div>
      {selected ? <MembersView key={cohortId} cohortId={cohortId} /> : <ErrorState what="this cohort" error={new ApiError("Cohort not found", 404)} homeTo="/instructor/cohorts/members" homeLabel="Manage students" />}
    </div>
  );
}

function MembersView({ cohortId }: { cohortId: string }) {
  const cohorts = useInstructorCohorts();
  const members = useMembers(cohortId);
  const changeRole = useChangeMemberRole(cohortId);
  const invitation = useInviteStudent(cohortId);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [payment, setPayment] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);
  const running = useRef(false);
  const cohort = cohorts.data?.find((c) => c.id === cohortId);
  const failed = cohorts.isError ? cohorts : members.isError ? members : null;

  async function updateRole(member: CohortMember, next: "student" | "ta") {
    if (running.current || member.role === "instructor" || member.role === next) return;
    running.current = true;
    setNotice(null);
    try {
      await changeRole.mutateAsync({ membershipId: member.id, role: next });
      setNotice({ kind: "success", message: `${member.username} is now ${next === "ta" ? "a teaching assistant" : "a student"}.` });
    } catch (error) {
      setNotice({ kind: "error", message: friendlyMessage(error, "Couldn’t change the member’s role. Please try again.") });
    } finally { running.current = false; }
  }

  if (failed) return <ErrorState what="cohort members" error={failed.error} onRetry={() => void failed.refetch()} />;
  if (cohorts.isPending || members.isPending) return <ListPageSkeleton label="Loading cohort members" />;
  if (!cohort) return <ErrorState what="this cohort" error={new ApiError("Cohort not found", 404)} homeTo="/instructor/cohorts" homeLabel="Back to cohorts" />;

  const rows = members.data ?? [];
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((m) => (role === "all" || m.role === role) && (payment === "all" || m.payment_status === payment) && (!needle || `${m.username} ${m.email}`.toLowerCase().includes(needle)));
  const paymentOptions = [...new Set(rows.map((m) => m.payment_status))].sort();
  const students = rows.filter((m) => m.role === "student").length;
  const assistants = rows.filter((m) => m.role === "ta").length;

  return (
    <div className="space-y-6">
      <header>
        <PageBreadcrumbs items={[{ label: "Cohorts", to: "/instructor/cohorts" }, { label: cohort.name, to: `/instructor/cohorts/${cohortId}/edit` }, { label: "Members" }]} />
        <h1 className="text-3xl font-bold tracking-tight text-gray-50">{cohort.name} members</h1>
        <p className="mt-1 text-sm text-gray-400">{cohort.course} · Invite students and manage teaching assistant roles.</p>
      </header>
      <ActionNotice notice={notice} onDismiss={dismiss} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={rows.length} hint="Everyone in this cohort" />
        <StatCard label="Students" value={students} hint={`${students} of ${cohort.seatsTotal} student seats`} />
        <StatCard label="Teaching assistants" value={assistants} hint="Supporting your students" />
      </div>
      <InvitationForm onCreate={(input) => invitation.mutateAsync(input)} />
      <section aria-labelledby="members-heading" className="space-y-4">
        <h2 id="members-heading" className="text-lg font-semibold text-gray-50">Members</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Search members" htmlFor="member-search">
            <input id="member-search" type="search" className={inputClass} placeholder="Name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <Field label="Role" htmlFor="member-role">
            <Select id="member-role" value={role} onChange={(value) => setRole(value as RoleFilter)} options={[{ value: "all", label: "All roles" }, { value: "student", label: "Student" }, { value: "ta", label: "Teaching assistant" }, { value: "instructor", label: "Instructor" }]} />
          </Field>
          <Field label="Payment status" htmlFor="member-payment">
            <Select id="member-payment" value={payment} onChange={setPayment} options={[{ value: "all", label: "All payment statuses" }, ...paymentOptions.map((p) => ({ value: p, label: p.replaceAll("_", " ") }))]} />
          </Field>
        </div>
        <MembersTable members={visible} filtered={Boolean(needle) || role !== "all" || payment !== "all"} busyId={changeRole.isPending ? changeRole.variables.membershipId : null} onRoleChange={(member, next) => void updateRole(member, next)} />
      </section>
    </div>
  );
}
