import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { CohortService } from "../../services/cohortService";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useEffect } from "react";

export function CohortSwitcher() {
  const queryClient = useQueryClient();

  const { data: cohorts = [] } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: CohortService.getMine,
  });

  // 1. Single hook handles state initialization, updates, and localStorage sync
  const [selectedId, setSelectedId] = useLocalStorage<number | null>(
    "activeCohortId",
    null
  );


  useEffect(() => {
    if (cohorts.length > 0 && !cohorts.some((c) => c.id === selectedId)) {
      setSelectedId(cohorts[0].id);
    }
  }, [cohorts, selectedId, setSelectedId]);

  // 2. Fallback to first cohort if selectedId is not set or not in current list
  const activeId =
    cohorts.find((c) => c.id === selectedId)?.id ?? cohorts[0]?.id ?? "";

  const handleSwitch = (id: number) => {
    setSelectedId(id);
    queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
  };

  const hasCohorts = cohorts.length > 0;

  return (
    <div className="relative hidden shrink-0 sm:block">
      <select
        aria-label="Select cohort"
        value={activeId}
        disabled={!hasCohorts}
        onChange={(e) => handleSwitch(Number(e.target.value))}
        className="h-9 max-w-[180px] cursor-pointer appearance-none truncate rounded-lg border border-[#30363d] bg-[#0d1117] pl-3 pr-8 font-mono text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!hasCohorts && <option value="">None</option>}
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
      />
    </div>
  );
}