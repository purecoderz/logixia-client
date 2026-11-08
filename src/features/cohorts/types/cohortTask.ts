export interface CohortTask {
  id: number;
  cohort_id: number;
  task_id: number;
  title: string;
  type: "code" | "quiz";
  module_title: string;
  lesson_title: string;
  start_date: string;
  due_date: string;
  xp: number;
  can_edit_xp: boolean;
}
export interface CohortTaskInput {
  task_id: number;
  start_date: string;
  due_date: string;
  xp: number;
}
export type CohortTaskPatch = Pick<
  CohortTaskInput,
  "start_date" | "due_date"
> & { xp?: number };
export interface ScheduleFields {
  start: string;
  due: string;
  xp: string;
}

export function scheduleError(fields: ScheduleFields): string | null {
  const start = new Date(fields.start).getTime();
  const due = new Date(fields.due).getTime();
  if (
    !fields.start ||
    !fields.due ||
    !Number.isFinite(start) ||
    !Number.isFinite(due)
  )
    return "Choose an opening date and a deadline.";
  if (due <= start) return "The deadline must be after the opening date.";
  if (!/^\d+$/.test(fields.xp) || !Number.isSafeInteger(Number(fields.xp)))
    return "XP must be a non-negative whole number.";
  return null;
}
export function schedulePayload(fields: ScheduleFields) {
  return {
    start_date: new Date(fields.start).toISOString(),
    due_date: new Date(fields.due).toISOString(),
    xp: Number(fields.xp),
  };
}
export function localDateTime(iso: string) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
export function cohortTaskStatus(
  task: Pick<CohortTask, "start_date" | "due_date">,
  now = Date.now(),
) {
  return now >= new Date(task.due_date).getTime()
    ? "Expired"
    : now < new Date(task.start_date).getTime()
      ? "Scheduled"
      : "Open";
}
