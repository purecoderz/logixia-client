import { useMemo } from "react";
import { useInstructorCohorts } from "@/features/cohorts/hooks/useCohorts";
import { useInstructorCourses } from "@/features/courses/hooks/useInstructorCourses";

export function useInstructorDashboard() {
  const courses = useInstructorCourses();
  const cohorts = useInstructorCohorts();
  const summary = useMemo(() => {
    const courseRows = courses.data ?? [];
    const cohortRows = cohorts.data ?? [];
    const activeCohorts = cohortRows.filter((cohort) =>
      ["open", "starting-soon", "in-progress"].includes(cohort.status),
    );
    return {
      courses: courseRows,
      cohorts: cohortRows,
      activeCohorts,
      publishedCourses: courseRows.filter(
        (course) => course.status === "published",
      ).length,
      enrolments: courseRows.reduce(
        (total, course) => total + course.students,
        0,
      ),
      occupiedSeats: cohortRows.reduce(
        (total, cohort) => total + cohort.seatsTaken,
        0,
      ),
      totalSeats: cohortRows.reduce(
        (total, cohort) => total + cohort.seatsTotal,
        0,
      ),
      recentCourses: [...courseRows]
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 4),
    };
  }, [courses.data, cohorts.data]);
  return { coursesQuery: courses, cohortsQuery: cohorts, summary };
}
