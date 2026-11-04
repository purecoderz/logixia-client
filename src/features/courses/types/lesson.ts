export interface LessonDetail {
  id: number;
  title: string;
  content: string; // Markdown
}

/** Only what changed is sent. */
export interface LessonPatch {
  title?: string;
  content?: string;
}
