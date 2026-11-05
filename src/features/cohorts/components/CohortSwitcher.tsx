import { Select } from "@/components/ui/Select";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useEffect, useMemo } from "react";
import { useMyCohorts } from "../hooks/useCohorts";
import { useQueryClient } from "@tanstack/react-query";
import { ASSIGNMENTS_KEY } from "@/features/assignments/hooks/useAssignments";

export function CohortSwitcher() {

  const { data, isSuccess } = useMyCohorts();
  const cohorts = useMemo(() => data ?? [], [data]);
  const queryClient = useQueryClient();

  // 1. Single hook handles state initialization, updates, and localStorage sync
  const [selectedId, setSelectedId] = useLocalStorage<number | null>(
    "activeCohortId",
    null
  );

  useEffect(() => {
    if (!isSuccess) return; // don't touch storage while loading or on a failed request

    if (cohorts.length === 0) {
      if (selectedId !== null) setSelectedId(null);
    } else if (!cohorts.some((c) => c.id === selectedId)) {
      setSelectedId(cohorts[0].id);
    }
  }, [isSuccess, cohorts, selectedId, setSelectedId]);
  // 2. Fallback to first cohort if selectedId is not set or not in current list
  const activeId =
    cohorts.find((c) => c.id === selectedId)?.id ?? cohorts[0]?.id ?? "";

  const handleSwitch = (id: number) => {
    setSelectedId(id);
    queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY });
  };

  const hasCohorts = cohorts.length > 0;

  return (
    <div className="relative hidden shrink-0 sm:block">
      <Select
        aria-label="Select cohort"
        value={String(activeId)}
        disabled={!hasCohorts}
        onChange={(value) => handleSwitch(Number(value))}
        placeholder="No cohorts"
        searchable
        searchPlaceholder="Search cohorts…"
        options={cohorts.map((c) => ({ value: String(c.id), label: c.name }))}
        className="max-w-[200px]"
      />
    </div>
  );
}