export interface CourseForEdit {
  id: number;
  title: string;
  slug: string;
  description: string;
  languageId: number;
  skills: string[];
  price: number | null;
  isPublished: boolean;
  isArchived: boolean;
}
