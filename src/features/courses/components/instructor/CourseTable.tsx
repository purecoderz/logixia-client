import { DataTable, type Column } from "../../../../components/ui/DataTable";
import { formatPrice } from "../../utils/formatPrice";
import { formatUpdated } from "../../utils/formatUpdated";
import type { InstructorCourse } from "../../types/types";
import { CourseActions } from "./CourseActions";
import { CourseStatusChip } from "./CourseStatusChip";

interface CourseTableProps {
  courses: InstructorCourse[];
  onPublish: (course: InstructorCourse) => void;
  onCreateCohort: (course: InstructorCourse) => void;
  onOpenMenu: (course: InstructorCourse) => void;
}

export function CourseTable({ courses, ...actions }: CourseTableProps) {
  const columns: Column<InstructorCourse>[] = [
    {
      header: "Course",
      cell: (c) => (
        <>
          {/* Swap for your router's <Link> */}
          <a href={`/instructor/courses/${c.id}`} className="block max-w-xs font-semibold text-gray-50 hover:text-sky-300 hover:underline">
            {c.title}
          </a>
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
          <CourseActions course={c} {...actions} />
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