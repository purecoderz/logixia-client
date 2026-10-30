import { Button } from "../../../components/ui/Button";
import { useInstructorCohorts } from "../../../features/cohorts/hooks/useCohorts";
import { CohortsPage } from "./CohortPage";


export function InstructorCohortsPage() {
  const { data, isPending, isError, error, refetch } = useInstructorCohorts();

  if (isPending) {
    return <p className="p-6 text-gray-400">Loading cohorts…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-gray-200">Couldn't load your cohorts.</p>
        <p className="text-sm text-gray-400">{error.message}</p>
        <Button variant="ghost" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return <CohortsPage cohorts={data} />;
}