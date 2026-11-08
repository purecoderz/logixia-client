import { useActiveCohort } from "../../cohorts/hooks/useActiveCohort";
import { ActiveCohortRequired } from "../../cohorts/components/students/ActiveCohortRequired";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorState } from "../../../components/ui/ErrorState";
// pages/Assignments/AssignmentsPage.tsx
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Zap } from "lucide-react";

import { useAssignments } from "../hooks/useAssignments";
import { SearchBar } from "../../../components/ui/SearchBar";
import { GlobalHero } from "../../cohorts/components/students/CohortsHero";
import { CardGridSkeleton } from "../../../components/ui/CardGridSkeleton";
import { AssignmentsView } from "../components/AssignmentView";
import { AlertModal } from "@/components/ui/AlertModal";
import { useNavigate } from "react-router-dom";
import { NoCohortError } from "../services/assignmentService";

const hero = {
  eyebrow: "Tasks",
  title: "Put your learning to work",
  description:
    "See what's due, pick up where you left off, and earn XP for every task you finish.",
  facts: [
    { icon: CalendarClock, label: "Deadlines at a glance" },
    { icon: CheckCircle2, label: "Checked automatically" },
    { icon: Zap, label: "Earn XP on every task" },
  ],
};

export function AssignmentsPage() {
  const membership = useActiveCohort();
  const [query, setQuery] = useState("");
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useAssignments();

  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const noCohort = error instanceof NoCohortError;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((a) =>
      `${a.title} ${a.type}`.toLowerCase().includes(q),
    );
  }, [query, assignments]);

  if (membership.isPending)
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Loading your cohorts…
      </p>
    );
  if (membership.error)
    return (
      <ErrorState
        what="your cohorts"
        error={membership.error}
        onRetry={() => void membership.refetch()}
      />
    );
  if (!membership.activeCohort)
    return (
      <ActiveCohortRequired
        cohorts={membership.cohorts}
        onSelect={membership.selectCohort}
      />
    );

  return (
    <div className="space-y-4">
      {error && !noCohort && (
        <ErrorState
          what="your tasks"
          error={error}
          onRetry={() => void refetch()}
          variant="section"
        />
      )}
      <SearchBar value={query} onChange={setQuery} placeholder="Search tasks" />
      <GlobalHero {...hero} />

      {isLoading ? (
        <CardGridSkeleton label="Loading tasks" />
      ) : (
        !error && <AssignmentsView assignments={matches} />
      )}

      <AlertModal
        isOpen={noCohort && !dismissed}
        title="No active cohort"
        message="Join a cohort to see your tasks."
        buttonText="Browse cohorts"
        variant="warning"
        onClose={() => {
          setDismissed(true);
          navigate("/student/cohorts");
        }}
      />
    </div>
  );
}
