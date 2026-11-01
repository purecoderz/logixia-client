import { useParams } from "react-router-dom";
import { ErrorState } from "../../../components/ui/ErrorState";
import { ApiError } from "../../../lib/apiError";
import { BuilderSkeleton } from "../components/instructor/builder/builderSkeleton";
import { CourseBuilderView } from "../components/instructor/builder/CourseBuilderView";
import { useCourseOutline } from "../hooks/useCourseOutline";

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const { data, isPending, isError, error, refetch } = useCourseOutline(courseId);

  if (!courseId) {
    return (
      <div className="p-6">
        <ErrorState what="the course" error={new ApiError("Missing course id", 404)} />
      </div>
    );
  }

  if (isPending) return <BuilderSkeleton />;

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState what="the course outline" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return <CourseBuilderView outline={data} />;
}