import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Spinner } from "../../../components/ui/Spinner";
import { CreateCourseForm } from "../components/instructor/CreateCourseForm";
import { useCourse } from "../hooks/useCourse";
import { useCreateCourse } from "../hooks/useCreateCourse";
import { useLanguages } from "../hooks/useLanguages";
import { CourseFormRejected } from "../services/courseService";
import { useUpdateCourse } from "../hooks/UseUpdateCourse";
import { toCoursePatch, toFormValues } from "../utils/courseFormValues";
import { builderPath, COURSES_PATH } from "../utils/paths";
import { PageBreadcrumbs, type Crumb } from "@/components/ui/BreadCrumbs";


/** Create a course, or edit one when the route has a :courseId. */
export default function CreateCoursePage() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const returnToCohort = !courseId && searchParams.get("returnTo") === "cohort";
  const editing = courseId !== undefined;
  const navigate = useNavigate();
  const languages = useLanguages();
  const course = useCourse(courseId);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  // What the form starts with, and what we compare against so only the changes are sent
  const initial = useMemo(() => (course.data ? toFormValues(course.data) : undefined), [course.data]);

  const failed = languages.isError ? languages : editing && course.isError ? course : null;
  const loading = !failed && (languages.isPending || (editing && course.isPending));

  const crumbs: Crumb[] = courseId
    ? [
        { label: "Courses", to: COURSES_PATH },
        { label: course.data?.title ?? "Course", to: builderPath(courseId) },
        { label: "Edit details" },
      ]
    : [{ label: "Courses", to: COURSES_PATH }, { label: "New course" }];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <PageBreadcrumbs items={crumbs} />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{editing ? "Edit course" : "Create course"}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {editing
            ? "Changes apply as soon as you save."
            : "Set up the basics now. Add lessons whenever you like, and you can run a cohort on this course right away."}
        </p>
      </div>

      {loading && (
        <p role="status" className="flex items-center gap-3 text-sm text-muted">
          <Spinner /> Loading the form…
        </p>
      )}

      {failed && (
        <ErrorState variant="section" what="the form" error={failed.error} onRetry={() => void failed.refetch()} />
      )}

      {languages.data && (!editing || initial) && (
        <CreateCourseForm
          key={courseId ?? "new"}
          languages={languages.data}
          initialValues={initial}
          slugLocked={course.data?.isPublished ?? false}
          onCancel={() => navigate(courseId ? builderPath(courseId) : returnToCohort ? "/instructor/cohorts/new" : COURSES_PATH)}
          onSubmit={async (values, action) => {
            try {
              if (courseId && initial) {
                const patch = toCoursePatch(initial, values);
                if (Object.keys(patch).length > 0) await updateCourse.mutateAsync({ courseId, patch });
                navigate(builderPath(courseId));
                return;
              }
              const created = await createCourse.mutateAsync(values);
              navigate(returnToCohort ? `/instructor/cohorts/new?course=${created.id}` : action === "builder" ? builderPath(created.id) : COURSES_PATH);
            } catch (error) {
              // Field problems go back to the form; anything else the form shows as a banner
              if (error instanceof CourseFormRejected) return error.errors;
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}