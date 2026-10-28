export type LessonType = 'video' | 'reading' | 'quiz' | 'assignment';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string; // e.g. "15 mins" or "10 questions"
  isFreePreview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export type CourseTab = 'curriculum' | 'settings' | 'students';

export interface CourseDetail {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'published' | 'draft' | 'archived';
  price: number;
  thumbnailUrl: string;
  modules: CourseModule[];
}