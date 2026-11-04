import { Link } from "react-router-dom";
import { DataTable, type Column } from "../../../../components/ui/DataTable";
import type { InstructorCourse } from "../../types/types";
import { formatPrice } from "../../utils/formatPrice";
import { formatUpdated } from "../../utils/formatUpdated";
import { CourseActions, type CourseHandlers } from "./CourseActions";
import { CourseStatusChip } from "./CourseStatusChip";
import { builderPath } from "../../utils/paths";

interface CourseTableProps {
  courses: InstructorCourse[];
  busyId: string | null;
  handlers: CourseHandlers;
}

export function CourseTable({ courses, busyId, handlers }: CourseTableProps) {
  const columns: Column<InstructorCourse>[] = [
    {
      header: "Course",
      cell: (c) => (
        <>
          <Link to={builderPath(c.id)} className="block max-w-xs font-semibold text-gray-50 hover:text-sky-300 hover:underline">
            {c.title}
          </Link>
          <p className="mt-0.5 text-xs text-gray-400">{c.language}</p>
        </>
      ),
    },
    { header: "Status", cell: (c) => <CourseStatusChip status={c.status} /> },
    { header: "Lessons", cell: (c) => <span className="font-medium">{c.lessons}</span> },
    { header: "Cohorts", cell: (c) => <span className="font-medium">{c.cohorts}</span> },
    { header: "Students", cell: (c) => <span className="font-medium">{c.students}</span> },
    { header: "Price", cell: (c) => <span className="font-medium">{formatPrice(c.price)}</span> },
    { header: "Updated", cell: (c) => <span className="text-gray-300">{formatUpdated(c.updatedAt)}</span> },
    {
      header: "Actions",
      hideHeader: true,
      cell: (c) => (
        <div className="flex justify-end">
          <CourseActions course={c} busy={busyId === c.id} handlers={handlers} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={courses}
      getRowKey={(c) => c.id}
      minWidth={980}
      emptyMessage="No courses match your filters."
    />
  );
}