// One place for query keys, so a save can refresh every course list at once.
export const courseKeys = {
  all: ["courses"] as const,
  instructor: () => [...courseKeys.all, "instructor"] as const,
  languages: () => ["languages"] as const,
};