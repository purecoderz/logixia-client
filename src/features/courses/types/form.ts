// Everything is a string or string[] because that's what form controls hold.
// It is converted to real numbers only when the form is submitted.
export interface CourseFormValues {
  title: string;
  slug: string;
  description: string;
  languageId: string; // "" until chosen
  skills: string[];
  price: string; // "50,000" as typed; "" until filled in
}

export type CourseFormField = keyof CourseFormValues;
export type CourseFormErrors = Partial<Record<CourseFormField, string>>;

export const emptyCourseForm: CourseFormValues = {
  title: "",
  slug: "",
  description: "",
  languageId: "",
  skills: [],
  price: "",
};

export interface Language {
  id: number;
  name: string;
}
