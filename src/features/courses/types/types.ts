export type InstructorCourseStatus = "draft" | "published" | "archived";

export interface InstructorCourse {
  id: string;
  title: string;
  language: string; // "Python"
  status: InstructorCourseStatus;
  price: number; // naira; 0 means free
  lessons: number;
  cohorts: number;
  students: number;
  updatedAt: string; // ISO date
}


