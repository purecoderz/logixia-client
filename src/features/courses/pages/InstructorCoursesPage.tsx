import { ErrorState } from "../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../components/ui/ListPageSkeleton";
import { InstructorCoursesView } from "../components/instructor/InstructorCoursesView";
import { useInstructorCourses } from "../hooks/useInstructorCourses";

export default function InstructorCoursesPage() {
  const { data, isPending, isError, error, refetch } = useInstructorCourses();

  if (isPending) return <ListPageSkeleton label="Loading your courses" />;

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState what="your courses" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return <InstructorCoursesView courses={data} />;
}