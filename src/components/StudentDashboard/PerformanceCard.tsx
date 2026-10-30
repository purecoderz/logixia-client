import { useMemo } from "react";
import type { Assignment } from "../../features/assignments/services/assignmentService";
import { DashboardCard, EmptyState, SeeAllLink } from "./DashboardCard";
import { byDue } from "../../features/assignments/utils/assignments";

export function PerformanceCard({ assignments }: { assignments: Assignment[] }) {
  const { bars, earned, total, maxXp } = useMemo(() => {
    const bars = [...assignments].sort(byDue).slice(-6);
    return {
      bars,
      earned: assignments.filter((a) => a.uiStatus === "done").reduce((s, a) => s + a.xp, 0),
      total: assignments.reduce((s, a) => s + a.xp, 0),
      maxXp: Math.max(...bars.map((b) => b.xp), 1),
    };
  }, [assignments]);

  return (
    <DashboardCard title="Performance" action={<SeeAllLink />}>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{earned}</span>
        <span className="text-xs text-[#8b949e]">of {total} XP earned</span>
      </div>

      {bars.length === 0 ? (
        <EmptyState>No assignments yet.</EmptyState>
      ) : (
        <div className="flex h-36 items-stretch justify-between gap-3">
          {bars.map((b) => (
            <div key={b.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-[11px] text-[#8b949e]">{b.xp}</span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  title={b.title}
                  className={`w-full max-w-9 rounded-md ${
                    b.uiStatus === "done" ? "bg-[#3fb950]" : "bg-[#30363d]"
                  }`}
                  style={{ height: `${(b.xp / maxXp) * 100}%` }}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] text-[#8b949e]">
                {b.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}