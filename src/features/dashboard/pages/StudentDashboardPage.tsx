import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignments } from "../../assignments/hooks/useAssignments";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import { DashboardHero } from "../components/student/DashboardHero";
import { PerformanceCard } from "../components/student/PerformanceCard";
import { DueSoonCard } from "../components/student/DueSoonCard";
import { ProgressCard } from "../components/student/ProgressCard";
import { TodayCard } from "../components/student/TodayCard";
import { UpcomingCard } from "../components/student/UpcomingCard";
import { PastDueCard } from "../components/student/PastDueCard";


export function StudentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: assignments = [], isLoading, error } = useAssignments();
  const { active, today, upcoming, pastDue } = useDashboardStats(assignments);


  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <DashboardHero
            name={profile?.username ?? "there"}
            dueCount={active.length}
            onReview={() => navigate("/assignments")}
          />

          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <PerformanceCard assignments={assignments} />
            <ProgressCard assignments={assignments} />
          </div>

          <DueSoonCard assignments={active.slice(0, 4)} isLoading={isLoading} error={error} />
        </div>

        <aside className="min-w-0 space-y-6">
          <TodayCard assignments={today} />
          <UpcomingCard assignments={upcoming.slice(0, 4)} />
          <PastDueCard assignments={pastDue.slice(0, 3)} />
        </aside>
      </div>
    </div>
  );
}