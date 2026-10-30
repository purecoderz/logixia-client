import type { ApiCohortDetails, CohortView } from "../Pages/CohortDetailsPage";
import { CohortUtils } from "./Cohorts";

export function toCohortView(data: ApiCohortDetails): CohortView {
  // "2026-11-03T09:00:00" -> "2026-11-03", the format CohortUtils expects
  const startDate = data.start.slice(0, 10);
  const endDate = data.end.slice(0, 10);
  const status = CohortUtils.getStatus(startDate, endDate);

  const weeks = (data.syllabus ?? []).map((m) => ({
    id: m.id,
    title: `Week ${m.module_order}: ${m.title}`,
    lessons: m.lessons ?? [],
  }));

  return {
    headline: data.name,
    summary: data.description,
    outcomes: (data.skills ?? []).map((s) => ({ title: s.title, text: s.description })),
    weeks,
    totalWeeks: weeks.length, // assumes one module = one week
    totalLessons: weeks.reduce((n, w) => n + w.lessons.length, 0),
    instructor: { name: data.instructor, bio: data.bio ?? undefined },
    status,
    startsOn: CohortUtils.formatStartsOn(startDate),
    durationLabel: CohortUtils.getDurationLabel(startDate, endDate, status),
    price: data.price,
  };
}