import { Link } from "react-router-dom";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { lessonEditorPath } from "@/features/courses/utils/paths";
import { taskEditorPath } from "../paths";
import type { TaskRow } from "../types";

const link = "block max-w-sm truncate hover:text-sky-300 hover:underline";

export function TaskTable({ courseId, rows }: { courseId: string; rows: TaskRow[] }) {
  const columns: Column<TaskRow>[] = [
    {
      header: "Task",
      cell: (t) => (
        <Link to={taskEditorPath(courseId, t.id)} className={`${link} font-semibold text-gray-50`}>
          {t.title}
        </Link>
      ),
    },
    {
      header: "Type",
      cell: (t) => <StatusChip tone={t.type === "code" ? "info" : "neutral"}>{t.type === "code" ? "Code" : "Quiz"}</StatusChip>,
    },
    {
      header: "Lesson",
      cell: (t) => (
        <Link to={lessonEditorPath(courseId, t.lessonId)} className={`${link} text-gray-200`}>
          <span className="text-gray-400">{t.lessonNumber}</span> {t.lessonTitle}
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(t) => String(t.id)} minWidth={600} />;
}