import type { Cohort } from "../components/Cohorts/CohortCard";
import type { CohortStatus, RawCohort } from "../services/cohortService";

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

  getDurationLabel(
    startStr: string,
    endStr: string,
    status: CohortStatus,
    today = startOfToday(),
  ): string {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return "N/A";

    const totalDays = daysBetween(start, end) + 1; // both days count
    const totalWeeks = Math.max(1, Math.round(totalDays / 7));

    if (status === "in-progress") {
      const elapsed = daysBetween(start, today);
      const currentWeek = Math.min(Math.floor(elapsed / 7) + 1, totalWeeks);
      return `Week ${currentWeek} of ${totalWeeks}`;
    }

    return `${totalWeeks} week${totalWeeks > 1 ? "s" : ""}`;
  },

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
      seatsTotal: item.seats_total ?? 20,
      price: item.price,
    };
  },
};