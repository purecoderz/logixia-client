import type { InstructorCourse } from "./types/types";

export const mockCourses: InstructorCourse[] = [
  { id: "1", price: 50000, title: "Python for Automating Boring Things", language: "Python", status: "published", lessons: 72, cohorts: 3, students: 60, updatedAt: "2026-10-27" },
  { id: "2", price: 40000, title: "JavaScript from Zero", language: "JavaScript", status: "published", lessons: 48, cohorts: 0, students: 0, updatedAt: "2026-10-20" },
  { id: "3", price: 30000, title: "SQL Foundations", language: "SQL", status: "draft", lessons: 12, cohorts: 0, students: 0, updatedAt: "2026-10-29" },
  { id: "4", price: 45000, title: "Data Analysis with Python", language: "Python", status: "published", lessons: 36, cohorts: 1, students: 18, updatedAt: "2026-09-30" },
  { id: "5", price: 20000, title: "HTML and CSS Basics", language: "HTML", status: "archived", lessons: 20, cohorts: 2, students: 40, updatedAt: "2026-06-10" },
];