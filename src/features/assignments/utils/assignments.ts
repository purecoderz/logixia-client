import type { Assignment } from "../services/assignmentService";

const DAY = 86_400_000;

export const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const daysUntil = (d: Date) =>
  Math.round((startOfDay(d) - startOfDay(new Date())) / DAY);

export const byDue = (x: Assignment, y: Assignment) =>
  new Date(x.due_date).getTime() - new Date(y.due_date).getTime();

export function dueText(a: Assignment) {
  const d = new Date(a.due_date);
  const days = daysUntil(d);
  if (days === 0) return `Today, ${formatTime(d)}`;
  if (days === 1) return `Tomorrow, ${formatTime(d)}`;
  return `In ${days} days`;
}