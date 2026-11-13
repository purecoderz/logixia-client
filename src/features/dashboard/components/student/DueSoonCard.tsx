import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { NoCohortError } from "@/features/assignments/services/assignmentService";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Code2,
  HelpCircle,
} from "lucide-react";

import { DashboardCard, EmptyState, SeeAllLink } from "./DashboardCard";
import type { Assignment } from "@/features/assignments/services/assignmentService";
import { dueText } from "@/features/assignments/utils/assignments";

type TaskFilter = "active" | "today" | "overdue";

function DueRow({ a, isOverdue = false }: { a: Assignment; isOverdue?: boolean }) {
  const isQuiz = a.type === "quiz";
  const taskUrl = isQuiz ? `/tasks/${a.id}/quiz` : `/tasks/${a.id}`;
  const TypeIcon = isQuiz ? HelpCircle : Code2;

  return (
    <Link
      to={taskUrl}
      className="group flex items-center gap-3 rounded-xl border border-line/60 bg-input p-3.5 transition-colors hover:border-line-strong hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
          isOverdue
            ? "bg-danger/10 text-danger"
            : "bg-[#1f6feb]/15 text-accent"
        }`}
      >
        <TypeIcon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {a.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          {isOverdue ? (
            <AlertCircle className="size-3.5 text-danger" aria-hidden />
          ) : (
            <Clock className="size-3.5" aria-hidden />
          )}
          <span className={isOverdue ? "text-danger font-medium" : ""}>
            {dueText(a)}
          </span>
          <span aria-hidden>·</span>
          <span>{a.status === null ? "Not started" : "In progress"}</span>
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-[#d29922]/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
        +{a.xp} XP
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

interface DueSoonCardProps {
  assignments: Assignment[];
  todayAssignments?: Assignment[];
  pastDueAssignments?: Assignment[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export function DueSoonCard({
  assignments,
  todayAssignments = [],
  pastDueAssignments = [],
  isLoading,
  error,
  onRetry,
}: DueSoonCardProps) {
  const [tab, setTab] = useState<TaskFilter>("active");

  const tabs: { id: TaskFilter; label: string; count: number }[] = [
    { id: "active", label: "Due soon", count: assignments.length },
    { id: "today", label: "Today", count: todayAssignments.length },
    { id: "overdue", label: "Overdue", count: pastDueAssignments.length },
  ];

  const activeList =
    tab === "today"
      ? todayAssignments
      : tab === "overdue"
        ? pastDueAssignments
        : assignments;

  const emptyMessage =
    tab === "today"
      ? "Nothing due today."
      : tab === "overdue"
        ? "No overdue tasks — you're right on track!"
        : "Nothing due right now.";

  return (
    <DashboardCard title="Tasks & Deadlines" action={<SeeAllLink />}>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selected
                  ? "border border-line bg-input text-foreground shadow-sm"
                  : "text-muted hover:bg-hover/60 hover:text-foreground"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  item.id === "overdue" && item.count > 0
                    ? "bg-danger/15 text-danger"
                    : selected
                      ? "bg-accent/15 text-accent"
                      : "bg-surface-muted text-muted"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-input" />
          ))}
        </div>
      ) : error ? (
        error instanceof NoCohortError ? (
          <div className="space-y-3 text-sm text-muted">
            <p>Join a cohort to see your tasks.</p>
            <Link
              to="/student/cohorts"
              className="inline-block font-medium text-accent hover:underline"
            >
              Browse cohorts →
            </Link>
          </div>
        ) : (
          <ErrorState
            what="upcoming tasks"
            error={error}
            onRetry={onRetry}
            variant="section"
          />
        )
      ) : activeList.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {activeList.slice(0, 5).map((a) => (
            <DueRow key={a.id} a={a} isOverdue={tab === "overdue"} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
