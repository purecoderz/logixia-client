import type { InstructorCohortStatus } from "../../types/cohort";


const config: Record<InstructorCohortStatus, { label: string; style: string }> = {
  draft: { label: "Draft", style: "border border-dashed border-gray-500 text-gray-300" },
  open: { label: "Open", style: "bg-emerald-500/15 text-emerald-300" },
  "starting-soon": { label: "Starting soon", style: "bg-amber-500/15 text-amber-300" },
  "in-progress": { label: "In progress", style: "bg-sky-500/15 text-sky-300" },
  completed: { label: "Completed", style: "bg-gray-500/20 text-gray-300" },
};

export function StatusChip({ status }: { status: InstructorCohortStatus }) {
  const { label, style } = config[status];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}