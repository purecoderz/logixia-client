export interface CreateCohortInput {
  name: string;
  course_id: number;
  start_date: string;
  end_date: string;
  price: number;
  seats: number;
}

export interface CohortFormValues {
  name: string;
  course_id: string;
  start_date: string;
  end_date: string;
  price: string;
  seats: string;
}
export type CohortFormErrors = Partial<Record<keyof CohortFormValues, string>>;

export function validateCohort(
  values: CohortFormValues,
  courseIds: string[],
): CohortFormErrors {
  const errors: CohortFormErrors = {};
  if (!values.name.trim()) errors.name = "Enter a cohort name.";
  if (!courseIds.includes(values.course_id))
    errors.course_id = "Select a course.";
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(values.start_date))
    errors.start_date = "Choose a valid start date.";
  if (!validDate(values.end_date)) errors.end_date = "Choose a valid end date.";
  else if (!errors.start_date && values.end_date < values.start_date)
    errors.end_date = "End date must be on or after the start date.";
  if (
    !/^\d+(\.\d{1,2})?$/.test(values.price) ||
    Number(values.price) > 99999999.99
  )
    errors.price =
      "Enter a price from 0 to 99,999,999.99, with up to two decimal places.";
  if (
    !/^\d+$/.test(values.seats) ||
    !Number.isSafeInteger(Number(values.seats)) ||
    Number(values.seats) < 1 ||
    Number(values.seats) > 2147483647
  )
    errors.seats =
      "Enter a whole number of seats greater than zero (up to 2,147,483,647).";
  return errors;
}
