import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { useInstructorCohorts } from "../hooks/useCohorts";
import { CohortsPage } from "../components/instructor/InstructorCohortsView";

export function InstructorCohortsPage() {
  const { data, isPending, isError, error, refetch } = useInstructorCohorts();
  if (isPending) return <ListPageSkeleton label="Loading your cohorts" />;
  if (isError) return <ErrorState what="your cohorts" error={error} onRetry={() => refetch()} />;
  return <CohortsPage cohorts={data} />;
}
