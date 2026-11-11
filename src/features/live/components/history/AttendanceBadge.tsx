import { Check, Circle, X } from "lucide-react";
import type { SessionAttendance } from "../../types/sessionHistory";

export function AttendanceBadge({
  attendance,
}: {
  attendance: SessionAttendance | null;
}) {
  if (!attendance)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-muted">
        <Circle className="size-3" aria-hidden /> Not recorded
      </span>
    );
  const present = attendance.status === "present";
  const Icon = present ? Check : X;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${present ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}
    >
      <Icon className="size-3" aria-hidden />
      {present ? "Attended" : "Missed"}
    </span>
  );
}
