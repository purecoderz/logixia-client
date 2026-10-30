import { useMemo } from "react";
import type { Assignment } from "../features/assignments/services/assignmentService";
import { byDue, daysUntil } from "../features/assignments/utils/assignments";

export function useDashboardStats(assignments: Assignment[]) {
  return useMemo(() => {
    const active = assignments.filter((a) => a.uiStatus === "active").sort(byDue);

    return {
      active,
      today: active.filter((a) => daysUntil(new Date(a.due_date)) === 0),
      upcoming: active.filter((a) => daysUntil(new Date(a.due_date)) > 0),
      pastDue: assignments
        .filter((a) => a.uiStatus === "missed" || a.uiStatus === "incomplete")
        .sort((x, y) => byDue(y, x)),
    };
  }, [assignments]);
}