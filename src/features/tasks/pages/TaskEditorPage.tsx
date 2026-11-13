import { useState } from "react";
import { Plus } from "lucide-react";
import { QuizEditorForm } from "../components/editor/QuizEditorForm";
import { emptyQuiz } from "../quizForm";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/apiError";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { courseKeys } from "@/features/courses/hooks/courseKeys";
import { builderPath, lessonEditorPath } from "@/features/courses/utils/paths";
import { TaskEditorForm } from "../components/editor/TaskEditorForm";
import { TaskService } from "../services/taskService";
import { emptyTask, type TaskInput } from "../taskForm";
import {
  newCodeTaskPath,
  newCohortTaskPath,
  newQuizTaskPath,
  taskEditorPath,
} from "../paths";

export default function TaskEditorPage() {
  const { courseId, lessonId, taskId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const client = useQueryClient();
  const [resetCount, setResetCount] = useState(0);
  const outline = useCourseOutline(courseId);
  const task = useQuery({
    queryKey: ["instructor-task", taskId],
    queryFn: () => TaskService.get(taskId!),
    enabled: Boolean(taskId),
  });
  if (!courseId || (!taskId && !lessonId))
    return (
      <ErrorState
        what="this task"
        error={new ApiError("Missing task context", 404)}
      />
    );
  const failed = outline.isError
    ? outline
    : taskId && task.isError
      ? task
      : null;
  if (failed)
    return (
      <ErrorState
        what="the task editor"
        error={failed.error}
        onRetry={() => void failed.refetch()}
      />
    );

  if (outline.isPending || (taskId && (task.isPending || task.isFetching)))
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Loading task editor…
      </p>
    );
  const ownerLessonId = taskId ? task.data?.lesson_id : Number(lessonId);
  const ownerModule = outline.data?.modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === ownerLessonId),
  );
  const lesson = ownerModule?.lessons.find(
    (lesson) => lesson.id === ownerLessonId,
  );
  const cohortOwned = Boolean(taskId && task.data?.owner_cohort_id && !task.data.lesson_id);
  if (!lesson && !cohortOwned)
    return (
      <ErrorState
        what="this lesson"
        error={new ApiError("Lesson not found in this course", 404)}
        homeTo={builderPath(courseId)}
        homeLabel="Back to builder"
      />
    );
  const kind =
    task.data?.type ?? (params.get("type") === "quiz" ? "quiz" : "code");
  const initial: TaskInput =
    task.data?.type === "quiz"
      ? {
        title: task.data.title,
        type: "quiz",
        instructions: task.data.instructions ?? "",
        questions: (task.data.questions ?? []).map((question) => ({
          ...question,
          explanation: question.explanation ?? "",
        })),
      }
      : task.data?.type === "code"
        ? {
          title: task.data.title,
          type: "code",
          instructions: task.data.instructions ?? "",
          starter_files: task.data.starter_files ?? emptyTask().starter_files,
          tests: { ...emptyTask().tests, ...task.data.tests },
        }
        : kind === "quiz"
          ? emptyQuiz()
          : emptyTask();
  const save = async (payload: TaskInput) => {
    const result = taskId
      ? await TaskService.update(taskId, payload)
      : await TaskService.create(String(lesson!.id), payload);
    client.setQueryData(["instructor-task", String(result.id)], result);
    void client.invalidateQueries({ queryKey: courseKeys.all });
    if (!taskId)
      navigate(taskEditorPath(courseId, result.id), { replace: true });
  };
  const title =
    kind === "quiz"
      ? taskId
        ? "Edit quiz"
        : "Create quiz"
      : taskId
        ? "Edit code task"
        : "Create code task";
  const cohortBack = task.data?.owner_cohort_id
    ? `/instructor/cohorts/tasks?cohort=${task.data.owner_cohort_id}`
    : null;
  const cancelTo = cohortBack ?? builderPath(courseId);
  const createCodeTo = lesson
    ? newCodeTaskPath(courseId, lesson.id)
    : task.data?.owner_cohort_id
      ? newCohortTaskPath(task.data.owner_cohort_id, "code")
      : null;
  const createQuizTo = lesson
    ? newQuizTaskPath(courseId, lesson.id)
    : task.data?.owner_cohort_id
      ? newCohortTaskPath(task.data.owner_cohort_id, "quiz")
      : null;
  const startNewTask = (nextKind: "code" | "quiz" = kind) => {
    setResetCount((count) => count + 1);
    const target = nextKind === "quiz" ? createQuizTo : createCodeTo;
    if (target) navigate(target);
  };
  const editorKey = taskId
    ? `edit-${taskId}-${task.dataUpdatedAt}-${resetCount}`
    : `new-${lesson!.id}-${kind}-${resetCount}`;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageBreadcrumbs
            items={[
              {
                label: outline.data?.title ?? "Course",
                to: builderPath(courseId),
              },
              ...(lesson
                ? [{ label: lesson.title, to: lessonEditorPath(courseId, lesson.id) }]
                : [{ label: "Cohort task", to: cohortBack ?? builderPath(courseId) }]),
              { label: title },
            ]}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {lesson ? `${ownerModule?.title} / ${lesson.title}` : "Created for a cohort · Not attached to a lesson"} ·{" "}
            {kind === "quiz"
              ? "Build multiple-choice questions and choose their correct answers."
              : "Configure the starter project and assessment checks."}
          </p>
        </div>
        {(createCodeTo || createQuizTo) && (
          <div className="flex flex-wrap items-center gap-2">
            {createCodeTo && (
              <Button variant="ghost" onClick={() => startNewTask("code")}>
                <Plus size={15} aria-hidden="true" />
                New code task
              </Button>
            )}
            {createQuizTo && (
              <Button variant="ghost" onClick={() => startNewTask("quiz")}>
                <Plus size={15} aria-hidden="true" />
                New quiz
              </Button>
            )}
          </div>
        )}
      </header>
      {!taskId && createCodeTo && createQuizTo && (
        <div className="flex border-b border-line">
          <Link
            to={createCodeTo}
            className={`min-h-11 border-b-2 px-4 py-3 text-sm font-semibold ${kind === "code" ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            Code task
          </Link>
          <Link
            to={createQuizTo}
            className={`min-h-11 border-b-2 px-4 py-3 text-sm font-semibold ${kind === "quiz" ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            Quiz
          </Link>
        </div>
      )}
      {initial.type === "quiz" ? (
        <QuizEditorForm
          key={editorKey}
          initial={initial}
          editing={Boolean(taskId)}
          onCancel={() => navigate(cancelTo)}
          onNew={() => startNewTask("quiz")}
          onSave={save}
        />
      ) : (
        <TaskEditorForm
          key={editorKey}
          initial={initial}
          editing={Boolean(taskId)}
          onCancel={() => navigate(cancelTo)}
          onNew={() => startNewTask("code")}
          onSave={save}
        />
      )}
    </div>
  );
}
