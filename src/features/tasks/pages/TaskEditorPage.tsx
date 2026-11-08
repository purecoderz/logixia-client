import { QuizEditorForm } from "../components/editor/QuizEditorForm";
import { emptyQuiz } from "../quizForm";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/apiError";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { courseKeys } from "@/features/courses/hooks/courseKeys";
import { builderPath, lessonEditorPath } from "@/features/courses/utils/paths";
import { TaskEditorForm } from "../components/editor/TaskEditorForm";
import { TaskService } from "../services/taskService";
import { emptyTask, type TaskInput } from "../taskForm";
import { taskEditorPath } from "../paths";

export default function TaskEditorPage() {
  const { courseId, lessonId, taskId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const client = useQueryClient();
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
  if (!lesson)
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
      : await TaskService.create(String(lesson.id), payload);
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
  const editorKey = taskId ? `edit-${taskId}-${task.dataUpdatedAt}` : `new-${lesson.id}-${kind}`;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <PageBreadcrumbs
          items={[
            {
              label: outline.data?.title ?? "Course",
              to: builderPath(courseId),
            },
            { label: lesson.title, to: lessonEditorPath(courseId, lesson.id) },
            { label: title },
          ]}
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {ownerModule?.title} / {lesson.title} ·{" "}
          {kind === "quiz"
            ? "Build multiple-choice questions and choose their correct answers."
            : "Configure the starter project and assessment checks."}
        </p>
      </header>
      {initial.type === "quiz" ? (
        <QuizEditorForm
          key={editorKey}
          initial={initial}
          editing={Boolean(taskId)}
          onCancel={() => navigate(builderPath(courseId))}
          onSave={save}
        />
      ) : (
        <TaskEditorForm
          key={editorKey}
          initial={initial}
          editing={Boolean(taskId)}
          onCancel={() => navigate(builderPath(courseId))}
          onSave={save}
        />
      )}
    </div>
  );
}
