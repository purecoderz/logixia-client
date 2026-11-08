export type InstructorCourseStatus = "draft" | "published" | "archived";

export interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  language: string; // display name, "Python"
  status: InstructorCourseStatus;
  /** Self-paced price in naira. 0 = free, null = not sold on its own. */
  price: number | null;
  lessons: number;
  cohorts: number;
  students: number;
  updatedAt: string; // ISO date
}
