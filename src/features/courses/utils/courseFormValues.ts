import type { CourseForEdit } from "../types/course";
import type { CourseFormValues } from "../types/form";
import type { CoursePatch } from "../types/Patch";
import { formatPriceInput, parsePrice } from "./priceInput";

export function toFormValues(c: CourseForEdit): CourseFormValues {
  return {
    title: c.title,
    slug: c.slug,
    description: c.description,
    languageId: String(c.languageId),
    skills: c.skills,
    price: c.price === null ? "" : formatPriceInput(String(c.price)),
  };
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Only what the instructor actually changed. */
export function toCoursePatch(before: CourseFormValues, after: CourseFormValues): CoursePatch {
  const patch: CoursePatch = {};
  if (after.title.trim() !== before.title.trim()) patch.title = after.title.trim();
  if (after.slug !== before.slug) patch.slug = after.slug;
  if (after.description.trim() !== before.description.trim()) patch.description = after.description.trim();
  if (after.languageId !== before.languageId) patch.language_id = Number(after.languageId);
  if (!sameList(before.skills, after.skills)) patch.skills = after.skills;
  if (parsePrice(after.price) !== parsePrice(before.price)) patch.price = parsePrice(after.price);
  return patch;
}