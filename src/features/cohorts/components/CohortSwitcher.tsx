import { describeError } from "@/lib/apiError";
import { Select } from "@/components/ui/Select";
import { useActiveCohort } from "../hooks/useActiveCohort";

export function CohortSwitcher() {
  const { cohorts, activeCohort, selectCohort, isPending, error, refetch } =
    useActiveCohort();
  const activeId = activeCohort?.id ?? "";
  const hasCohorts = cohorts.length > 0;

  if (error) {
    const copy = describeError(error, "your cohorts");
    return (
      <div
        role="alert"
        className="hidden shrink-0 items-center gap-2 text-xs text-danger sm:flex"
      >
        <span title={copy.text}>
          {copy.kind === "auth" ? "Sign in again" : "Cohorts unavailable"}
        </span>
        {copy.retryable && (
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded border border-line px-2 py-1 text-accent"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative hidden shrink-0 sm:block">
      <Select
        aria-label="Select cohort"
        value={String(activeId)}
        disabled={!hasCohorts}
        onChange={(value) => selectCohort(Number(value))}
        placeholder={
          isPending
            ? "Loading cohorts…"
            : hasCohorts
              ? "Choose cohort"
              : "No cohorts"
        }
        searchable
        searchPlaceholder="Search cohorts…"
        options={cohorts.map((c) => ({ value: String(c.id), label: c.name }))}
        className="max-w-[200px]"
      />
    </div>
  );
}
