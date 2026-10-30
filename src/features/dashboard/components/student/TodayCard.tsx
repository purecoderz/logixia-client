import { Link } from "react-router-dom";
import { DashboardCard, EmptyState } from "./DashboardCard";
import type { Assignment } from "@/features/assignments/services/assignmentService";
import { formatTime } from "@/features/assignments/utils/assignments";

export function TodayCard({ assignments }: { assignments: Assignment[] }) {
  return (
    <DashboardCard
      title="Today"
      action={<span className="text-xs text-[#8b949e]">{assignments.length} due today</span>}
    >
      {assignments.length === 0 ? (
        <EmptyState>Nothing due today.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-stretch gap-3">
              <span className="w-14 shrink-0 pt-3 text-right text-xs text-[#8b949e]">
                {formatTime(new Date(a.due_date))}
              </span>
              <Link
                to={`/assignments/${a.id}`}
                className="min-w-0 flex-1 rounded-xl border-l-4 border-[#d29922] bg-[#0d1117] p-3 transition-colors hover:bg-[#21262d]"
              >
                <p className="truncate text-sm font-semibold text-white">{a.title}</p>
                <p className="mt-0.5 text-xs text-[#8b949e]">+{a.xp} XP</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}