import { useParams } from "react-router-dom";
import { ErrorState } from "../../../components/ui/ErrorState";
import { ApiError } from "../../../lib/apiError";
import { useCourseOutline } from "../hooks/useCourseOutline";
import { useLesson } from "../hooks/useLesson";
import { LessonEditorView } from "../components/instructor/LessonEditorView";

const bone = "rounded-md bg-gray-800 motion-safe:animate-pulse";

function LessonSkeleton() {
  return (
    <div role="status" aria-label="Loading the lesson" className="space-y-6 p-6">
      <span className="sr-only">Loading the lesson…</span>
      <div className={`${bone} h-3.5 w-64`} />
      <div className={`${bone} h-9 w-96 max-w-full`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${bone} h-[calc(100dvh-22rem)] min-h-[24rem]`} />
        <div className={`${bone} h-[calc(100dvh-22rem)] min-h-[24rem]`} />
      </div>
    </div>
  );
}

export default function LessonEditorPage() {
  const { courseId, lessonId } = useParams();
  const lesson = useLesson(lessonId);
  const outline = useCourseOutline(courseId);

  if (!courseId || !lessonId) {
    return (
      <div className="p-6">
        <ErrorState what="the lesson" error={new ApiError("Missing id", 404)} />
      </div>
    );
  }

  if (lesson.isPending || outline.isPending) return <LessonSkeleton />;

  const failed = lesson.isError ? lesson : outline.isError ? outline : null;
  if (failed?.isError) {
    return (
      <div className="p-6">
        <ErrorState
          what="the lesson"
          error={failed.error}
          onRetry={() => {
            void lesson.refetch();
            void outline.refetch();
          }}
        />
      </div>
    );
  }

  // `key` gives each lesson its own editor, so moving to the next lesson starts clean
  return <LessonEditorView key={lessonId} courseId={courseId} lesson={lesson.data!} outline={outline.data!} />;
}