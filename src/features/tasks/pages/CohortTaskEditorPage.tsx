import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormError } from "@/components/ui/FormError";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { ApiError } from "@/lib/apiError";
import { useInstructorCohorts } from "@/features/cohorts/hooks/useCohorts";
import { ScheduleInputs } from "@/features/cohorts/components/instructor/ScheduleInputs";
import {
  scheduleError,
  schedulePayload,
  type ScheduleFields,
} from "@/features/cohorts/types/cohortTask";
import { cohortTaskKey } from "@/features/cohorts/Services/cohortTaskService";
import { QuizEditorForm } from "../components/editor/QuizEditorForm";
import { TaskEditorForm } from "../components/editor/TaskEditorForm";
import { TaskService } from "../services/taskService";
import { emptyQuiz } from "../quizForm";
import { emptyTask, type TaskInput } from "../taskForm";
import { newCohortTaskPath } from "../paths";

const initialSchedule: ScheduleFields = { start: "", due: "", xp: "10" };

export default function CohortTaskEditorPage() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const cohorts = useInstructorCohorts();
  const [schedule, setSchedule] = useState(initialSchedule);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  if (!cohortId) {
    return (
      <ErrorState
        what="this cohort"
        error={new ApiError("Missing cohort", 404)}
      />
    );
  }
  if (cohorts.isPending) {
    return <ListPageSkeleton label="Loading cohort task editor" />;
  }
  if (cohorts.error) {
    return (
      <ErrorState
        what="your cohorts"
        error={cohorts.error}
        onRetry={() => void cohorts.refetch()}
      />
    );
  }
  const cohort = cohorts.data.find((item) => item.id === cohortId);
  if (!cohort) {
    return (
      <ErrorState
        what="this cohort"
        error={new ApiError("Cohort not found", 404)}
        homeTo="/instructor/cohorts/tasks"
        homeLabel="Back to cohort tasks"
      />
    );
  }
  const selectedCohort = cohort;

  const kind = params.get("type") === "quiz" ? "quiz" : "code";
  const back = `/instructor/cohorts/tasks?cohort=${encodeURIComponent(cohort.id)}`;
  async function save(task: TaskInput) {
    const problem = scheduleError(schedule);
    setScheduleMessage(problem);
    if (problem) throw new ApiError(problem, 422);
    const { xp, ...dates } = schedulePayload(schedule);
    await TaskService.createForCohort(selectedCohort.id, task, { ...dates, xp });
    await client.invalidateQueries({ queryKey: cohortTaskKey(selectedCohort.id) });
    navigate(back, { replace: true });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <PageBreadcrumbs
          items={[
            { label: "Manage cohort tasks", to: back },
            { label: cohort.name },
            { label: kind === "quiz" ? "Create quiz" : "Create code task" },
          ]}
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {kind === "quiz"
            ? "Create and assign quiz"
            : "Create and assign code task"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create an exercise for {cohort.name} without adding it to a lesson.
          You can attach it to the curriculum later.
        </p>
      </header>

      <div className="flex border-b border-line">
        <Link
          to={newCohortTaskPath(cohort.id)}
          className={`min-h-11 border-b-2 px-4 py-3 text-sm font-semibold ${kind === "code" ? "border-accent text-accent" : "border-transparent text-muted"}`}
        >
          Code task
        </Link>
        <Link
          to={newCohortTaskPath(cohort.id, "quiz")}
          className={`min-h-11 border-b-2 px-4 py-3 text-sm font-semibold ${kind === "quiz" ? "border-accent text-accent" : "border-transparent text-muted"}`}
        >
          Quiz
        </Link>
      </div>

      <section
        className="space-y-4 rounded-xl border border-line bg-surface p-5"
        aria-labelledby="cohort-task-schedule"
      >
        <div>
          <h2
            id="cohort-task-schedule"
            className="font-semibold text-foreground"
          >
            Assignment schedule
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            The task definition and its cohort assignment are saved together.
            Dates use your local timezone.
          </p>
        </div>
        {scheduleMessage && <FormError message={scheduleMessage} />}
        <ScheduleInputs
          prefix="new-cohort-task"
          fields={schedule}
          onChange={(next) => {
            setSchedule(next);
            setScheduleMessage(null);
          }}
        />
      </section>

      {kind === "quiz" ? (
        <QuizEditorForm
          key={`cohort-${cohort.id}-quiz`}
          initial={emptyQuiz()}
          editing={false}
          onCancel={() => navigate(back)}
          onNew={() => {
            setSchedule(initialSchedule);
            setScheduleMessage(null);
          }}
          onSave={save}
        />
      ) : (
        <TaskEditorForm
          key={`cohort-${cohort.id}-code`}
          initial={emptyTask()}
          editing={false}
          onCancel={() => navigate(back)}
          onNew={() => {
            setSchedule(initialSchedule);
            setScheduleMessage(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}
