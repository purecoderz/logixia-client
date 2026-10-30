// pages/Assignments/AssignmentsPage.tsx
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Zap } from "lucide-react";

import { useAssignments } from "../../hooks/useAssignments";
import { SearchBar } from "../../components/Cohorts/SearchBar";
import { GlobalHero } from "../../components/Cohorts/CohortsHero";
import { AssignmentsView } from "../../components/AssignmentUi/AssignmentView";
import { CardGridSkeleton } from "../../components/ui/CardGridSkeleton";

const hero = {
  eyebrow: "Assignments",
  title: "Put your learning to work",
  description: "See what's due, pick up where you left off, and earn XP for every task you finish.",
  facts: [
    { icon: CalendarClock, label: "Deadlines at a glance" },
    { icon: CheckCircle2, label: "Checked automatically" },
    { icon: Zap, label: "Earn XP on every task" },
  ],
};

export function AssignmentsPage() {
  const [query, setQuery] = useState("");
  const { data: assignments = [], isLoading, error } = useAssignments();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((a) => `${a.title} ${a.type}`.toLowerCase().includes(q));
  }, [query, assignments]);

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500">{error.message}</p>}
      <SearchBar value={query} onChange={setQuery} placeholder="Search assignments" />
      <GlobalHero {...hero} />

      {isLoading ? (
        <CardGridSkeleton label="Loading assignments" />
      ) : (
        !error && <AssignmentsView assignments={matches} />
      )}
    </div>
  );
}