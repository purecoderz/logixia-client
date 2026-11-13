import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useActiveCohort } from "../../cohorts/hooks/useActiveCohort";
import { ActiveCohortRequired } from "../../cohorts/components/students/ActiveCohortRequired";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorState } from "../../../components/ui/ErrorState";
import { NoCohortError } from "../../assignments/services/assignmentService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignments } from "../../assignments/hooks/useAssignments";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import { DashboardHero } from "../components/student/DashboardHero";
import { PerformanceCard } from "../components/student/PerformanceCard";
import { ProgressCard } from "../components/student/ProgressCard";
import { DueSoonCard } from "../components/student/DueSoonCard";
import { NextClassCard } from "../components/student/NextClassCard";
import { DailyChallengeCard } from "../components/student/DailyChallengeCard";
import { CohortLeaderboardCard } from "../components/student/CohortLeaderboardCard";

function StudentStatCard({
  label,
  value,
  detail,
  Icon,
  tone = "accent",
}: {
  label: string;
  value: string | number;
  detail: string;
  Icon: LucideIcon;
  tone?: "accent" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "warning"
        ? "bg-warning/10 text-warning"
        : tone === "danger"
          ? "bg-danger/10 text-danger"
          : "bg-accent/10 text-accent";

  return (
    <article className="student-card rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-muted">{detail}</p>
    </article>
  );
}

export function StudentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const membership = useActiveCohort();

  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useAssignments();
  const { active, today, pastDue } = useDashboardStats(assignments);

  const metrics = useMemo(() => {
    const completed = assignments.filter((a) => a.uiStatus === "done").length;
    const total = assignments.length;
    const earnedXp = assignments
      .filter((a) => a.uiStatus === "done")
      .reduce((sum, a) => sum + a.xp, 0);
    const totalXp = assignments.reduce((sum, a) => sum + a.xp, 0);
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, earnedXp, totalXp, completionPct };
  }, [assignments]);

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
  if (error && !(error instanceof NoCohortError))
    return (
      <ErrorState
        what="your dashboard"
        error={error}
        onRetry={() => void refetch()}
      />
    );

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <DashboardHero
        name={profile?.username ?? "there"}
        cohortName={membership.activeCohort.name}
        dueCount={active.length}
        todayCount={today.length}
        onReview={() => navigate("/tasks")}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard
          label="XP Earned"
          value={metrics.earnedXp}
          detail={`of ${metrics.totalXp} XP in cohort`}
          Icon={Trophy}
          tone="warning"
        />
        <StudentStatCard
          label="Completed"
          value={`${metrics.completed}/${metrics.total}`}
          detail={`${metrics.completionPct}% completion rate`}
          Icon={CheckCircle2}
          tone="success"
        />
        <StudentStatCard
          label="Active Tasks"
          value={active.length}
          detail={
            today.length > 0
              ? `${today.length} due today`
              : "Up-to-date schedule"
          }
          Icon={Clock}
          tone="accent"
        />
        <StudentStatCard
          label="Overdue"
          value={pastDue.length}
          detail={
            pastDue.length === 0 ? "All on track" : "Needs your attention"
          }
          Icon={AlertTriangle}
          tone={pastDue.length > 0 ? "danger" : "success"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 space-y-6">
          <DueSoonCard
            assignments={active}
            todayAssignments={today}
            pastDueAssignments={pastDue}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refetch()}
          />
          <PerformanceCard assignments={assignments} />
          <ProgressCard assignments={assignments} />
        </div>

        <aside className="min-w-0 space-y-6">
          <NextClassCard cohortId={membership.activeCohort.id} />
          <DailyChallengeCard />
          <CohortLeaderboardCard cohortId={membership.activeCohort.id} />
        </aside>
      </div>
    </div>
  );
}
