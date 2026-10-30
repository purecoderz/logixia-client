import type { InstructorCohort } from "../../types/types";
import { formatNaira } from "../../../../utils/format";
import { DataTable, type Column } from "../../../../components/ui/DataTable";
import { StatusChip } from "./StatusChip";
import { CohortActions } from "./CohortActions";
import { ScheduleSummary } from "./ScheduleSummary";
import { SeatsSummary } from "./SeatsSummary";

interface CohortTableProps {
  cohorts: InstructorCohort[];
  onCopyLink: (cohort: InstructorCohort) => void;
  onPublish: (cohort: InstructorCohort) => void;
  onOpenMenu: (cohort: InstructorCohort) => void;
}

export function CohortTable({ cohorts, ...actions }: CohortTableProps) {
  const columns: Column<InstructorCohort>[] = [
    {
      header: "Cohort",
      cell: (c) => (
        <>
          {/* Swap for your router's <Link> */}
          <a href={`/cohorts/${c.id}`} className="block max-w-xs font-semibold text-gray-50 hover:text-sky-300 hover:underline">
            {c.name}
          </a>
          <p className="mt-0.5 max-w-xs text-xs text-gray-400">{c.course}</p>
        </>
      ),
    },
    { header: "Status", cell: (c) => <StatusChip status={c.status} /> },
    { header: "Schedule", cell: (c) => <ScheduleSummary cohort={c} /> },
    { header: "Seats", cell: (c) => <SeatsSummary cohort={c} /> },
    {
      header: "Revenue",
      cell: (c) => <span className="font-medium">{formatNaira(c.seatsTaken * c.price)}</span>,
    },
    {
      header: "Actions",
      hideHeader: true,
      cell: (c) => (
        <div className="flex justify-end">
          <CohortActions cohort={c} {...actions} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={cohorts}
      getRowKey={(c) => c.id}
      minWidth={980}
      emptyMessage="No cohorts match your filters."
    />
  );
}