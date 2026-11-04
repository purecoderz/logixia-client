export interface CoursePatch {
  title?: string;
  slug?: string;
  description?: string;
  language_id?: number;
  skills?: string[];
  price?: number | null;
  is_published?: boolean;
  is_archived?: boolean;
}