import { Link, useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { lessonEditorPath } from "@/features/courses/utils/paths";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { taskTestPath, taskEditorPath } from "../paths";
import type { TaskRow } from "../types";

const link = "block max-w-sm truncate hover:text-accent hover:underline";

export function TaskTable({ courseId, rows, onDelete, busy = false }: { courseId: string; rows: TaskRow[]; onDelete: (task: TaskRow) => void; busy?: boolean }) {
  const navigate = useNavigate();
  const columns: Column<TaskRow>[] = [
    {
      header: "Task",
      cell: (t) => (
        <Link to={taskEditorPath(courseId, t.id)} className={`${link} font-semibold text-foreground`}>
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
        <Link to={lessonEditorPath(courseId, t.lessonId)} className={`${link} text-body`}>
          <span className="text-muted">{t.lessonNumber}</span> {t.lessonTitle}
        </Link>
      ),
    },
    {
      header: "Actions",
      cell: (task) => <div className="flex justify-end"><ActionMenu label={`Actions for ${task.title}`} disabled={busy} items={[
        { label: "Edit task", onSelect: () => navigate(taskEditorPath(courseId, task.id)) },
        { label: "Test task", onSelect: () => navigate(taskTestPath(courseId, task.id)) },
        { label: "Delete task", onSelect: () => onDelete(task) },
      ]} /></div>,
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(t) => String(t.id)} minWidth={600} />;
}