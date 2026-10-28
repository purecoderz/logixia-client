export type CourseStatus = 'published' | 'draft' | 'archived';

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  status: CourseStatus;
  enrolledStudents: number;
  activeCohorts: number;
  modulesCount: number;
  completionRate: number; // percentage (0 - 100)
  rating: number;
  updatedAt: string;
}

export interface CourseStatsData {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgCompletionRate: number;
}