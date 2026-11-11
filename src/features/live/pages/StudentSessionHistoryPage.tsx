import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { ActiveCohortRequired } from "@/features/cohorts/components/students/ActiveCohortRequired";
import { useActiveCohort } from "@/features/cohorts/hooks/useActiveCohort";
import { SessionMaterials } from "../components/SessionMaterials";
import { SessionHistoryView } from "../components/history/SessionHistoryView";
import { useSessionHistory } from "../hooks/useSessionHistory";
import type { SessionHistoryEntry } from "../types/sessionHistory";

export function StudentSessionHistoryPage() {
  const cohort = useActiveCohort();
  if (cohort.isPending)
    return <ListPageSkeleton label="Loading your session history" />;
  if (cohort.error)
    return (
      <ErrorState
        what="your cohorts"
        error={cohort.error}
        onRetry={() => void cohort.refetch()}
      />
    );
  if (!cohort.activeCohort)
    return (
      <ActiveCohortRequired
        cohorts={cohort.cohorts}
        onSelect={cohort.selectCohort}
      />
    );
  return (
    <SessionHistoryContent
      key={cohort.activeCohort.id}
      cohortId={cohort.activeCohort.id}
      cohortName={cohort.activeCohort.name}
    />
  );
}

function SessionHistoryContent({
  cohortId,
  cohortName,
}: {
  cohortId: number;
  cohortName: string;
}) {
  const history = useSessionHistory(cohortId);
  const [notes, setNotes] = useState<SessionHistoryEntry | null>(null);

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <p className="mb-2 text-xs font-semibold text-accent">{cohortName}</p>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Session history
          </h1>
          <p className="mt-2 text-sm text-muted">
            Review recordings and your attendance from your active cohort.
          </p>
        </div>
      </header>

      {history.isPending ? (
        <ListPageSkeleton label={`Loading ${cohortName} session history`} />
      ) : history.error ? (
        <ErrorState
          what="your session history"
          error={history.error}
          onRetry={() => void history.refetch()}
        />
      ) : history.data.length ? (
        <SessionHistoryView sessions={history.data} onNotes={setNotes} />
      ) : (
        <div className="rounded-xl border border-dashed border-line px-5 py-14 text-center">
          <h2 className="font-semibold text-foreground">No completed sessions yet</h2>
          <p className="mt-2 text-sm text-muted">
            Recordings and attendance will appear here after your classes end.
          </p>
        </div>
      )}

      {notes && (
        <SessionMaterials
          session={notes}
          open
          onClose={() => setNotes(null)}
        />
      )}
    </div>
  );
}
