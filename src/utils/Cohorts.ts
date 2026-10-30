import type { Cohort } from "../components/Cohorts/CohortCard";
import type { InstructorCohort } from "../types/cohort";
import type { CohortStatus, RawCohort, RawInstructorCohort } from "../services/cohortService";

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-09-23" -> local midnight, or null if missing or invalid
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

// today at midnight, so only whole days are compared
function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export const CohortUtils = {
  formatStartsOn(dateString: string): string {
    const date = parseDate(dateString);
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  getStatus(startStr: string, endStr: string, today = startOfToday()): CohortStatus {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return "open";

    if (today > end) return "completed";
    if (today >= start) return "in-progress";
    return daysBetween(today, start) <= 7 ? "starting-soon" : "open";
  },

  /** Single source for the week maths, shared by the student and instructor views. */
  getWeekProgress(
    startStr: string,
    endStr: string,
    today = startOfToday(),
  ): { currentWeek: number; totalWeeks: number } | null {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return null;

    const totalDays = daysBetween(start, end) + 1; // both days count
    const totalWeeks = Math.max(1, Math.round(totalDays / 7));
    const elapsed = daysBetween(start, today);
    const currentWeek = Math.max(1, Math.min(Math.floor(elapsed / 7) + 1, totalWeeks));
    return { currentWeek, totalWeeks };
  },

  getDurationLabel(
    startStr: string,
    endStr: string,
    status: CohortStatus,
    today = startOfToday(),
  ): string {
    const progress = CohortUtils.getWeekProgress(startStr, endStr, today);
    if (!progress) return "N/A";

    const { currentWeek, totalWeeks } = progress;
    if (status === "in-progress") return `Week ${currentWeek} of ${totalWeeks}`;
    return `${totalWeeks} week${totalWeeks > 1 ? "s" : ""}`;
  },

  // Student view
  transform(item: RawCohort): Cohort {
    const status = CohortUtils.getStatus(item.start_date, item.end_date);

    return {
      id: `c${item.id}`,
      status,
      name: item.name,
      subtitle: item.subtitle ?? "Learn to code live",
      startsOn: CohortUtils.formatStartsOn(item.start_date),
      durationLabel: CohortUtils.getDurationLabel(item.start_date, item.end_date, status),
      seatsTaken: item.seats_taken ?? 0,
      // API sends `seats`; `seats_total` kept as a fallback for older responses
      seatsTotal: item.seats ?? item.seats_total ?? 20,
      price: item.price,
    };
  },

  // Instructor view: the server already worked out the status (it knows about drafts)
  transformForInstructor(item: RawInstructorCohort): InstructorCohort {
    const progress =
      item.status === "in-progress"
        ? CohortUtils.getWeekProgress(item.start_date, item.end_date)
        : null;

    return {
      id: String(item.id),
      name: item.name,
      course: item.course_title,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      seatsTaken: item.seats_taken,
      seatsTotal: item.seats,
      price: item.price,
      currentWeek: progress?.currentWeek,
      totalWeeks: progress?.totalWeeks,
    };
  },
};