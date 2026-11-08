import { Select } from "@/components/ui/Select";
import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useInstructorCourses } from "@/features/courses/hooks/useInstructorCourses";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ErrorState } from "@/components/ui/ErrorState";
import { Field, fieldProps } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import {
  useCreateCohort,
  useInstructorCohorts,
  useUpdateCohort,
} from "../hooks/useCohorts";
import {
  validateCohort,
  type CohortFormErrors,
  type CohortFormValues,
  type CreateCohortInput,
} from "../types/create";
import type { InstructorCourse } from "@/features/courses/types/types";

type CourseOption = Pick<InstructorCourse, "id" | "title" | "status">;

const NEW_COURSE = "/instructor/courses/new?returnTo=cohort";

export default function CreateCohortPage() {
  const { cohortId } = useParams();
  const editing = cohortId !== undefined;
  const cohorts = useInstructorCohorts(editing);
  const cohort = cohorts.data?.find((c) => c.id === cohortId);
  const courses = useInstructorCourses();
  const [params] = useSearchParams();
  const available: CourseOption[] =
    courses.data?.filter(
      (c) => c.status !== "archived" || c.id === String(cohort?.courseId),
    ) ?? [];
  // Keep the existing relationship editable even if the linked course is no longer listed.
  if (cohort && !available.some((c) => c.id === String(cohort.courseId))) {
    available.push({
      id: String(cohort.courseId),
      title: cohort.course,
      status: "archived",
    });
  }
  const initialValues: CohortFormValues | undefined = cohort
    ? {
        name: cohort.name,
        course_id: String(cohort.courseId),
        start_date: cohort.startDate ?? "",
        end_date: cohort.endDate ?? "",
        price: String(cohort.price),
        seats: String(cohort.seatsTotal),
      }
    : undefined;
  const failed = courses.isError
    ? courses
    : editing && cohorts.isError
      ? cohorts
      : null;
  const loading = courses.isPending || (editing && cohorts.isPending);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <PageBreadcrumbs
          items={[
            { label: "Cohorts", to: "/instructor/cohorts" },
            { label: editing ? "Edit cohort" : "New cohort" },
          ]}
        />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {editing ? "Edit cohort" : "Create cohort"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {editing
            ? "Update the cohort details. Changes apply as soon as you save."
            : "Choose a course, set your dates, and decide how many students can join."}
        </p>
      </header>
      {loading && !failed ? (
        <p role="status" className="flex items-center gap-3 text-sm text-muted">
          <Spinner /> Loading the form…
        </p>
      ) : failed ? (
        <ErrorState
          variant="section"
          what="the form"
          error={failed.error}
          onRetry={() => void failed.refetch()}
        />
      ) : editing && !cohort ? (
        <ErrorState
          error={new ApiError("Cohort not found", 404)}
          what="this cohort"
          homeTo="/instructor/cohorts"
          homeLabel="Back to cohorts"
        />
      ) : available.length === 0 ? (
        <div className="space-y-4 rounded-xl border border-line bg-surface-muted/30 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Create a course first
          </h2>
          <p className="text-sm text-muted">
            Every cohort needs a course for its modules and lessons. You can
            start with a draft course and add content later. Archived courses
            can’t be used for new cohorts.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={NEW_COURSE}>Create course</ButtonLink>
            <ButtonLink variant="ghost" to="/instructor/courses">
              View courses
            </ButtonLink>
          </div>
        </div>
      ) : (
        <CohortForm
          key={cohortId ? `${cohortId}:${cohort?.courseId}` : "new"}
          cohortId={cohortId}
          initialValues={initialValues}
          courses={available}
          initialCourse={params.get("course") ?? ""}
        />
      )}
    </div>
  );
}

function CohortForm({
  courses,
  initialCourse,
  cohortId,
  initialValues,
}: {
  courses: CourseOption[];
  initialCourse: string;
  cohortId?: string;
  initialValues?: CohortFormValues;
}) {
  const navigate = useNavigate();
  const create = useCreateCohort();
  const update = useUpdateCohort();
  const saving = create.isPending || update.isPending;
  const submitting = useRef(false);
  const [values, setValues] = useState<CohortFormValues>(
    initialValues ?? {
      name: "",
      course_id: courses.some((c) => c.id === initialCourse)
        ? initialCourse
        : courses.length === 1
          ? courses[0].id
          : "",
      start_date: "",
      end_date: "",
      price: "0",
      seats: "30",
    },
  );
  const [errors, setErrors] = useState<CohortFormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  function change(key: keyof CohortFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors({});
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const found = validateCohort(
      values,
      courses.map((c) => c.id),
    );
    setErrors(found);
    const first = (Object.keys(values) as (keyof CohortFormValues)[]).find(
      (key) => found[key],
    );
    if (first) {
      document.getElementById(`cohort-${first}`)?.focus();
      return;
    }
    submitting.current = true;
    setMessage(null);
    try {
      const payload: CreateCohortInput = {
        name: values.name.trim(),
        course_id: Number(values.course_id),
        start_date: values.start_date,
        end_date: values.end_date,
        price: Number(values.price),
        seats: Number(values.seats),
      };
      if (cohortId && initialValues) {
        const previous: CreateCohortInput = {
          name: initialValues.name.trim(),
          course_id: Number(initialValues.course_id),
          start_date: initialValues.start_date,
          end_date: initialValues.end_date,
          price: Number(initialValues.price),
          seats: Number(initialValues.seats),
        };
        const patch = Object.fromEntries(
          Object.entries(payload).filter(
            ([key, value]) =>
              value !== previous[key as keyof CreateCohortInput],
          ),
        ) as Partial<CreateCohortInput>;
        if (Object.keys(patch).length)
          await update.mutateAsync({ id: cohortId, patch });
      } else await create.mutateAsync(payload);
      navigate("/instructor/cohorts");
    } catch (error) {
      setMessage(
        error instanceof ApiError && error.status === 409
          ? "This cohort name is already in use. Choose another name."
          : error instanceof ApiError && error.status === 422
            ? "Some details weren’t accepted. Check the fields and try again."
            : friendlyMessage(
                error,
                "Couldn’t save the cohort. Please try again.",
              ),
      );
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="overflow-hidden rounded-xl border border-line bg-surface-muted/20"
    >
      <fieldset disabled={saving} className="space-y-5 p-6 disabled:opacity-70">
        <legend className="sr-only">Cohort details</legend>
        {message && (
          <FormError message={message} onDismiss={() => setMessage(null)} />
        )}
        <Field
          label="Course"
          htmlFor="cohort-course_id"
          error={errors.course_id}
          hint="Draft and published courses can be used for a cohort."
        >
          <Select
            {...fieldProps("cohort-course_id", errors.course_id, true)}
            disabled={saving}
            value={values.course_id}
            onChange={(value) => change("course_id", value)}
            placeholder="Select a course"
            searchable
            searchPlaceholder="Search courses…"
            options={courses.map((c) => ({
              value: c.id,
              label: c.title,
              description:
                c.status === "draft"
                  ? "Draft course"
                  : c.status === "archived"
                    ? "Archived course"
                    : "Published course",
            }))}
          />
        </Field>
        {!cohortId && (
          <ButtonLink to={NEW_COURSE} variant="ghost">
            Create a new course
          </ButtonLink>
        )}
        <Field
          label="Cohort name"
          htmlFor="cohort-name"
          error={errors.name}
          hint="Use a unique name, such as Python Evening Class — January 2027."
        >
          <input
            {...fieldProps("cohort-name", errors.name, true)}
            required
            className={inputClass}
            value={values.name}
            onChange={(e) => change("name", e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["start_date", "Start date"],
              ["end_date", "End date"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              htmlFor={`cohort-${key}`}
              error={errors[key]}
            >
              <input
                {...fieldProps(`cohort-${key}`, errors[key])}
                type="date"
                required
                min={key === "end_date" ? values.start_date : undefined}
                className={inputClass}
                value={values[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Price per student (₦)"
            htmlFor="cohort-price"
            error={errors.price}
            hint="Enter 0 for a free cohort."
          >
            <input
              {...fieldProps("cohort-price", errors.price, true)}
              type="number"
              inputMode="decimal"
              min="0"
              max="99999999.99"
              step="0.01"
              required
              className={inputClass}
              value={values.price}
              onChange={(e) => change("price", e.target.value)}
            />
          </Field>
          <Field label="Seats" htmlFor="cohort-seats" error={errors.seats}>
            <input
              {...fieldProps("cohort-seats", errors.seats)}
              type="number"
              min="1"
              step="1"
              required
              className={inputClass}
              value={values.seats}
              onChange={(e) => change("seats", e.target.value)}
            />
          </Field>
        </div>
      </fieldset>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line p-6">
        <p className="text-sm text-muted">
          {cohortId
            ? "Saving keeps the current publication status."
            : "Saves as a draft. Publish from your cohorts page when ready."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => navigate("/instructor/cohorts")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} aria-busy={saving}>
            {saving ? (
              <>
                <Spinner tone="dark" /> {cohortId ? "Saving…" : "Creating…"}
              </>
            ) : cohortId ? (
              "Save changes"
            ) : (
              "Create cohort"
            )}
          </Button>
        </div>
      </footer>
    </form>
  );
}
