import { BookOpen, CalendarPlus, GraduationCap, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useInstructorDashboard } from "../hooks/useInstructorDashboard";
import {
  InstructorDashboardSection,
  InstructorStatCard,
} from "../components/instructor/InstructorDashboardCard";

const quickActions = [
  { to: "/instructor/courses/new", label: "Create course", Icon: Plus },
  { to: "/instructor/cohorts/new", label: "Create cohort", Icon: GraduationCap },
  { to: "/instructor/sessions", label: "Schedule session", Icon: CalendarPlus },
  { to: "/instructor/tasks", label: "Manage tasks", Icon: BookOpen },
];

export function InstructorDashboardPage() {
  const { profile } = useAuth();
  const { coursesQuery, cohortsQuery, summary } = useInstructorDashboard();

  if (coursesQuery.isPending || cohortsQuery.isPending)
    return <ListPageSkeleton label="Loading instructor dashboard" />;
  const failed = coursesQuery.error
    ? coursesQuery
    : cohortsQuery.error
      ? cohortsQuery
      : null;
  if (failed)
    return (
      <ErrorState
        what="your instructor dashboard"
        error={failed.error}
        onRetry={() => void failed.refetch()}
      />
    );

  const {
    courses,
    cohorts,
    activeCohorts,
    publishedCourses,
    enrolments,
    occupiedSeats,
    totalSeats,
    recentCourses,
  } = summary;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <header className="rounded-2xl border border-accent/20 bg-accent/[0.06] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Instructor overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {profile?.username ?? "instructor"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Keep your curriculum, cohorts, sessions, and student activity moving from one place.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className="flex min-h-14 items-center gap-3 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:border-line-strong hover:bg-hover">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="size-4" aria-hidden /></span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InstructorStatCard label="Courses" value={courses.length} detail={`${publishedCourses} published`} Icon={BookOpen} />
        <InstructorStatCard label="Active cohorts" value={activeCohorts.length} detail={`${cohorts.length} cohorts total`} Icon={GraduationCap} />
        <InstructorStatCard label="Course enrolments" value={enrolments} detail="Across your course catalogue" Icon={Users} />
        <InstructorStatCard label="Cohort seats" value={occupiedSeats} detail={`${totalSeats} seats available in total`} Icon={Users} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <InstructorDashboardSection title="Recently updated courses" action={<Link to="/instructor/courses" className="text-xs text-muted hover:text-foreground">View all</Link>}>
          {recentCourses.length ? (
            <div className="divide-y divide-line">
              {recentCourses.map((course) => (
                <Link key={course.id} to={`/instructor/courses/${course.id}/builder`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:text-accent">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{course.title}</p><p className="mt-1 text-xs text-muted">{course.language} · {course.lessons} lessons</p></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${course.status === "published" ? "bg-success/10 text-success" : course.status === "archived" ? "bg-hover text-muted" : "bg-warning/10 text-warning"}`}>{course.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyDashboardState text="Create your first course to start building a curriculum." to="/instructor/courses/new" action="Create course" />
          )}
        </InstructorDashboardSection>

        <InstructorDashboardSection title="Active cohorts" action={<Link to="/instructor/cohorts" className="text-xs text-muted hover:text-foreground">Manage cohorts</Link>}>
          {activeCohorts.length ? (
            <div className="space-y-3">
              {activeCohorts.slice(0, 4).map((cohort) => {
                const percentage = cohort.seatsTotal ? Math.round((cohort.seatsTaken / cohort.seatsTotal) * 100) : 0;
                return <Link key={cohort.id} to={`/instructor/cohorts/${cohort.id}/members`} className="block rounded-xl bg-input p-3 hover:bg-hover"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{cohort.name}</p><p className="mt-1 truncate text-xs text-muted">{cohort.course}</p></div><span className="text-xs text-muted">{cohort.seatsTaken}/{cohort.seatsTotal}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, percentage)}%` }} /></div></Link>;
              })}
            </div>
          ) : (
            <EmptyDashboardState text="No active cohort yet." to="/instructor/cohorts/new" action="Create cohort" />
          )}
        </InstructorDashboardSection>
      </div>
    </div>
  );
}

function EmptyDashboardState({ text, to, action }: { text: string; to: string; action: string }) {
  return <div className="rounded-xl border border-dashed border-line px-5 py-8 text-center"><p className="text-sm text-muted">{text}</p><Link to={to} className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">{action}</Link></div>;
}
