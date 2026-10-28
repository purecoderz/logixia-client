// pages/Assignments/AssignmentsPage.tsx
import { useEffect, useMemo, useState } from "react";

import { AssignmentService, type Assignment } from "../../services/assignmentService";
import { SearchBar } from "../../components/Cohorts/SearchBar";
import { CalendarClock, CheckCircle2, Zap } from "lucide-react";
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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchAssignments = async () => {
      setErrMessage(null);
      try {
        const response = await AssignmentService.getAssignments();
        const responses = await AssignmentService.getTask();
        if (!ignore) setAssignments(response);
      } catch (err) {
        if (!ignore) {
          setErrMessage(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchAssignments();
    return () => {
      ignore = true;
    };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignments;

    return assignments.filter((a) =>
      `${a.title} ${a.lesson_title} ${a.cohort_name}`.toLowerCase().includes(q)
    );
  }, [query, assignments]);

  return (
    <div className="space-y-4">
      {errMessage && <p className="text-red-500">{errMessage}</p>}
      <SearchBar value={query} onChange={setQuery} placeholder="Search assignments" />
      <GlobalHero {...hero} />

      {isLoading ? <CardGridSkeleton label="Loading assignments" /> : (
        !errMessage && <AssignmentsView assignments={matches} />
      )}
    </div>
  );
}