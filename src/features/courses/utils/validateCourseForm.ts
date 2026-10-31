import type { CourseFormErrors, CourseFormValues } from "../types/form";
import { parsePrice } from "./priceInput";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Rules for SAVING A DRAFT. Selling is stricter, see getSaleChecklist. */
export function validateCourseForm(v: CourseFormValues): CourseFormErrors {
  const errors: CourseFormErrors = {};

  const title = v.title.trim();
  if (!title) errors.title = "Give the course a title.";
  else if (title.length < 3) errors.title = "Use at least 3 characters.";
  else if (title.length > 100) errors.title = "Keep the title under 100 characters.";

  if (!v.slug) errors.slug = "A web address is needed.";
  else if (!SLUG_PATTERN.test(v.slug)) {
    errors.slug = "Use lowercase letters, numbers and single dashes only.";
  }

  if (!v.languageId) errors.languageId = "Choose the language this course teaches.";

  if (v.description.length > 5000) errors.description = "Keep the description under 5000 characters.";

  if (v.skills.some((s) => s.length > 40)) errors.skills = "Keep each skill under 40 characters.";

  if (v.price.trim() === "") errors.price = "Enter a price, or 0 for a free course.";
  else if (parsePrice(v.price) === null) errors.price = "Use numbers only, like 50,000.";

  return errors;
}

export const hasErrors = (e: CourseFormErrors) => Object.keys(e).length > 0;

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
}

/** What the side panel shows. The "module with a lesson" item is added by the builder later. */
export function getSaleChecklist(v: CourseFormValues): ChecklistItem[] {
  return [
    { key: "title", label: "Title and web address", done: v.title.trim().length >= 3 && SLUG_PATTERN.test(v.slug) },
    { key: "description", label: "Description", done: v.description.trim().length > 0 },
    { key: "language", label: "Language", done: v.languageId !== "" },
    { key: "skills", label: "At least 3 skills", done: v.skills.length >= 3 },
  ];
}