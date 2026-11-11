import { useNavigate } from "react-router-dom";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { taskEditorPath, taskTestPath } from "@/features/tasks/paths";
import { cohortTaskStatus, type CohortTask } from "../../types/cohortTask";

export function CohortTaskTable({
  rows,
  courseId,
  now,
  onEdit,
  onRemove,
  busy = false,
}: {
  rows: CohortTask[];
  courseId: number;
  now: number;
  onEdit: (task: CohortTask) => void;
  onRemove: (task: CohortTask) => void;
  busy?: boolean;
}) {
  const navigate = useNavigate();
  const format = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line bg-input text-xs text-muted">
          <tr>
            {["Task", "Opens", "Deadline", "XP", "Status", "Actions"].map(
              (label) => (
                <th key={label} className="px-4 py-3 font-medium">
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((task) => {
            const status = cohortTaskStatus(task, now);
            return (
              <tr key={task.id}>
                <td className="max-w-xs px-4 py-4">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {task.lesson_title ?? "Cohort-created task"}
                  </p>
                  <span className="mt-1 block text-[11px] text-muted">
                    {task.type === "code" ? "Code task" : "Quiz"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-body">
                  {format(task.start_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-body">
                  {format(task.due_date)}
                </td>
                <td className="px-4 py-4 font-medium text-foreground">
                  {task.xp}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${status === "Open" ? "bg-emerald-500/10 text-success" : status === "Scheduled" ? "bg-accent/10 text-accent" : "bg-hover text-muted"}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ActionMenu
                    disabled={busy}
                    label={`Actions for ${task.title}`}
                    items={[
                      {
                        label: "Edit task content",
                        onSelect: () =>
                          navigate(taskEditorPath(courseId, task.task_id)),
                      },
                      {
                        label: "Preview / test task",
                        onSelect: () =>
                          navigate(taskTestPath(courseId, task.task_id)),
                      },
                      {
                        label: "Edit schedule / XP",
                        onSelect: () => onEdit(task),
                      },
                      {
                        label: "Remove from cohort",
                        onSelect: () => onRemove(task),
                      },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
