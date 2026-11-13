import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Flame, Info, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { Field, fieldProps } from "@/components/ui/Field";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { StatusChip } from "@/components/ui/StatusChip";
import { useInstructorCohorts } from "@/features/cohorts/hooks/useCohorts";
import { useMembers } from "@/features/cohorts/hooks/useMemberships";
import {
  CohortTaskService,
  cohortTaskKey,
} from "@/features/cohorts/Services/cohortTaskService";
import { useCohortLeaderboard } from "@/features/cohorts/Services/leaderboardService";
import {
  cohortTaskStatus,
  type CohortTask,
} from "@/features/cohorts/types/cohortTask";
import {
  attemptKey,
  indexAttempts,
  useCohortSubmissions,
  type AttemptStatus,
} from "../services/submissionService";

type Tab = "students" | "tasks";

interface StudentRow {
  userId: string;
  username: string;
  email: string;
  xp: number;
  streak: number;
  submitted: number;
  passed: number;
}

export default function StudentManagementPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cohorts = useInstructorCohorts();

  if (cohorts.isPending) return <ListPageSkeleton label="Loading your cohorts" />;
  if (cohorts.isError)
    return (
      <ErrorState
        what="your cohorts"
        error={cohorts.error}
        onRetry={() => void cohorts.refetch()}
      />
    );
  if (cohorts.data.length === 0)
    return (
      <div className="space-y-4 rounded-xl border border-line bg-surface-muted/30 p-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Student management
        </h1>
        <p className="text-sm text-muted">
          Create a cohort first to track student streaks and task submissions.
        </p>
        <ButtonLink to="/instructor/cohorts/new">Create cohort</ButtonLink>
      </div>
    );

  const requested = params.get("cohort");
  const cohortId =
    requested && cohorts.data.some((c) => c.id === requested)
      ? requested
      : cohorts.data[0].id;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Student management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track streaks and see who completed each cohort task.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <Field label="Cohort" htmlFor="students-cohort">
            <Select
              {...fieldProps("students-cohort", undefined, true)}
              value={cohortId}
              onChange={(value) =>
                navigate(
                  `/instructor/students?cohort=${encodeURIComponent(value)}`,
                )
              }
              placeholder="Select a cohort"
              searchable
              searchPlaceholder="Search cohorts…"
              className="!min-h-9 !py-2"
              icon={<Users size={16} />}
              options={cohorts.data.map((c) => ({
                value: c.id,
                label: c.name,
                description: c.course,
              }))}
            />
          </Field>
        </div>
      </header>
      <CohortStudentsView key={cohortId} cohortId={cohortId} />
    </div>
  );
}

function CohortStudentsView({ cohortId }: { cohortId: string }) {
  const members = useMembers(cohortId);
  const leaderboard = useCohortLeaderboard(Number(cohortId) || null);
  const tasks = useQuery({
    queryKey: cohortTaskKey(cohortId),
    queryFn: () => CohortTaskService.list(cohortId),
  });
  const submissions = useCohortSubmissions(cohortId);
  const [tab, setTab] = useState<Tab>("students");
  const [query, setQuery] = useState("");

  const students = useMemo(
    () => (members.data ?? []).filter((m) => m.role === "student"),
    [members.data],
  );
  // Only tasks that have opened count toward a student's completion.
  const released = useMemo(
    () =>
      (tasks.data ?? []).filter((t) => cohortTaskStatus(t) !== "Scheduled"),
    [tasks.data],
  );
  const attempts = useMemo(
    () => (submissions.data ? indexAttempts(submissions.data) : null),
    [submissions.data],
  );

  const rows: StudentRow[] = useMemo(() => {
    const streaks = new Map(
      (leaderboard.data ?? []).map((e) => [e.user_id, e.current_streak]),
    );
    return students.map((m) => {
      let submitted = 0;
      let passed = 0;
      if (attempts)
        for (const t of released) {
          const a = attempts.get(attemptKey(t.id, m.user_id));
          if (a?.submitted) submitted++;
          if (a?.passed) passed++;
        }
      return {
        userId: m.user_id,
        username: m.username,
        email: m.email,
        xp: m.total_xp,
        streak: streaks.get(m.user_id) ?? 0,
        submitted,
        passed,
      };
    });
  }, [students, leaderboard.data, attempts, released]);

  const failed = members.isError ? members : tasks.isError ? tasks : null;
  if (failed)
    return (
      <ErrorState
        what="this cohort's students"
        error={failed.error}
        onRetry={() => void failed.refetch()}
      />
    );
  if (members.isPending || tasks.isPending)
    return <ListPageSkeleton label="Loading students" />;

  const activeStreaks = rows.filter((r) => r.streak > 0).length;
  const avgStreak = rows.length
    ? (rows.reduce((s, r) => s + r.streak, 0) / rows.length).toFixed(1)
    : "0";
  const possible = rows.length * released.length;
  const totalPassed = rows.reduce((s, r) => s + r.passed, 0);
  const totalSubmitted = rows.reduce((s, r) => s + r.submitted, 0);
  const completion =
    attempts && possible ? `${Math.round((totalPassed / possible) * 100)}%` : "—";

  const q = query.trim().toLowerCase();
  const visible = rows
    .filter(
      (r) =>
        !q ||
        r.username.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    )
    .sort((a, b) => b.passed - a.passed || b.streak - a.streak || b.xp - a.xp);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={rows.length} />
        <StatCard
          label="Active streaks"
          value={activeStreaks}
          hint={`Average streak ${avgStreak} days`}
        />
        <StatCard
          label="Tasks released"
          value={released.length}
          hint={`${(tasks.data?.length ?? 0) - released.length} scheduled`}
        />
        <StatCard
          label="Completed correctly"
          value={completion}
          hint={
            attempts
              ? `${totalPassed} passed of ${totalSubmitted} submitted`
              : "Waiting for submission data"
          }
        />
      </div>

      {submissions.data === null && (
        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-muted/30 p-4 text-sm text-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          Submission tracking isn’t available from the server yet. Streaks and
          XP are shown; task completion will appear once submissions are
          enabled.
        </p>
      )}
      {submissions.isError && (
        <ErrorState
          what="task submissions"
          error={submissions.error}
          onRetry={() => void submissions.refetch()}
        />
      )}

      <FilterTabs<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "students", label: `Students (${rows.length})` },
          { value: "tasks", label: `Task submissions (${released.length})` },
        ]}
      />

      {tab === "students" ? (
        <section className="space-y-3">
          <div className="max-w-sm">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search students"
            />
          </div>
          {visible.length === 0 ? (
            <p className="rounded-xl border border-line p-6 text-center text-sm text-muted">
              {rows.length === 0
                ? "No students in this cohort yet."
                : "No students match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-surface">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Streak</th>
                    <th className="px-4 py-3 font-medium">XP</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((r) => (
                    <tr key={r.userId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {r.username}
                        </p>
                        <p className="text-xs text-muted">{r.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 font-mono ${r.streak > 0 ? "text-warning" : "text-muted"}`}
                        >
                          <Flame size={14} aria-hidden />
                          {r.streak}
                          <span className="sr-only"> day streak</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-body">{r.xp}</td>
                      <td className="px-4 py-3 font-mono text-body">
                        {attempts ? `${r.submitted}/${released.length}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {attempts ? (
                          <div className="flex min-w-32 items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar
                                value={r.passed}
                                max={released.length || 1}
                                tone="success"
                                label={`${r.username} correct tasks`}
                              />
                            </div>
                            <span className="font-mono text-xs text-body">
                              {r.passed}/{released.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          {released.length === 0 ? (
            <p className="rounded-xl border border-line p-6 text-center text-sm text-muted">
              No tasks have opened for this cohort yet.
            </p>
          ) : (
            released
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.due_date).getTime() -
                  new Date(a.due_date).getTime(),
              )
              .map((t) => (
                <TaskSubmissionRow
                  key={t.id}
                  task={t}
                  students={rows}
                  attempts={attempts}
                />
              ))
          )}
        </section>
      )}
    </div>
  );
}

function TaskSubmissionRow({
  task,
  students,
  attempts,
}: {
  task: CohortTask;
  students: StudentRow[];
  attempts: Map<string, AttemptStatus> | null;
}) {
  const [open, setOpen] = useState(false);
  const status = cohortTaskStatus(task);
  const groups = { passed: [] as StudentRow[], failed: [] as StudentRow[], missing: [] as StudentRow[] };
  for (const s of students) {
    const a = attempts?.get(attemptKey(task.id, s.userId));
    if (a?.passed) groups.passed.push(s);
    else if (a?.submitted) groups.failed.push(s);
    else groups.missing.push(s);
  }
  const total = students.length;
  const submitted = groups.passed.length + groups.failed.length;

  return (
    <article className="rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!attempts}
        className="flex w-full flex-col gap-3 p-4 text-left md:flex-row md:items-center"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium text-foreground">
              {task.title}
            </h3>
            <StatusChip tone="neutral">
              {task.type === "quiz" ? "Quiz" : "Code"}
            </StatusChip>
            <StatusChip tone={status === "Open" ? "success" : "warning"}>
              {status}
            </StatusChip>
          </div>
          <p className="mt-1 text-xs text-muted">
            Due {new Date(task.due_date).toLocaleString()} · {task.xp} XP
          </p>
        </div>
        {attempts ? (
          <div className="flex items-center gap-6 md:w-96">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs text-muted">
                <span>Correct</span>
                <span className="font-mono text-body">
                  {groups.passed.length}/{total}
                </span>
              </div>
              <ProgressBar
                value={groups.passed.length}
                max={total || 1}
                tone="success"
                label={`${task.title} correct submissions`}
              />
            </div>
            <div className="text-right text-xs text-muted">
              <p className="font-mono text-sm text-body">
                {submitted}/{total}
              </p>
              submitted
            </div>
            <ChevronDown
              size={16}
              aria-hidden
              className={`text-muted transition-transform ${open ? "" : "-rotate-90"}`}
            />
          </div>
        ) : (
          <span className="text-xs text-muted">No submission data</span>
        )}
      </button>
      {open && attempts && (
        <div className="grid gap-4 border-t border-line p-4 md:grid-cols-3">
          <StudentGroup title="Correct" tone="text-success" list={groups.passed} />
          <StudentGroup title="Submitted, not correct" tone="text-warning" list={groups.failed} />
          <StudentGroup title="Not submitted" tone="text-muted" list={groups.missing} />
        </div>
      )}
    </article>
  );
}

function StudentGroup({
  title,
  tone,
  list,
}: {
  title: string;
  tone: string;
  list: StudentRow[];
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone}`}>
        {title} ({list.length})
      </p>
      <ul className="mt-2 space-y-1 text-sm text-body">
        {list.length === 0 ? (
          <li className="text-muted">—</li>
        ) : (
          list.map((s) => <li key={s.userId}>{s.username}</li>)
        )}
      </ul>
    </div>
  );
}
