const MAX_LENGTH = 60;

/** "Python for Café & Co!" -> "python-for-cafe-co" */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, ""); // the cut may leave a trailing dash
}
