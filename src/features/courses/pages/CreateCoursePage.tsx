import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { CreateCourseForm } from "../components/instructor/CreateCourseForm";
import { useCreateCourse } from "../hooks/useCreateCourse";
import { useLanguages } from "../hooks/useLanguages";
import { CourseFormRejected } from "../services/courseService";

// TODO: change these paths if your routes are named differently
const COURSES_PATH = "/instructor/courses";
const builderPath = (id: number) => `/instructor/courses/${id}/builder`;

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const languages = useLanguages();
  const createCourse = useCreateCourse();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 flex gap-2 text-sm text-gray-400">
          <Link to={COURSES_PATH} className="hover:text-gray-200 hover:underline">
            Courses
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-gray-200">
            New course
          </span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-gray-50">Create course</h1>
        <p className="mt-1.5 text-sm text-gray-400">
          Set up the basics now. Add lessons whenever you like, and you can run a cohort on this course right away.
        </p>
      </div>

      {languages.isPending && <p className="text-gray-400">Loading…</p>}

      {languages.isError && (
        <div className="space-y-3">
          <p className="text-gray-200">Couldn't load the form.</p>
          <p className="text-sm text-gray-400">{languages.error.message}</p>
          <Button variant="ghost" onClick={() => languages.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {languages.data && (
        <CreateCourseForm
          languages={languages.data}
          onCancel={() => navigate(COURSES_PATH)}
          onSubmit={async (values, action) => {
            try {
              const course = await createCourse.mutateAsync(values);
              navigate(action === "builder" ? builderPath(course.id) : COURSES_PATH);
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