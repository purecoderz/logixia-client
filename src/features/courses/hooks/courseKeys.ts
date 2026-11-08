// One place for query keys, so a save can refresh every course list at once.
export const courseKeys = {
  all: ["courses"] as const,
  instructor: () => [...courseKeys.all, "instructor"] as const,
  outline: (courseId: string) =>
    [...courseKeys.all, "outline", courseId] as const,
  lesson: (lessonId: string) =>
    [...courseKeys.all, "lesson", lessonId] as const,
  detail: (courseId: string) =>
    [...courseKeys.all, "detail", courseId] as const,
  languages: () => ["languages"] as const,
};
