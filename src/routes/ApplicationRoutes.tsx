import type { Location } from "react-router-dom";
import { Route, Routes } from "react-router-dom";

import { AuthPage } from "@/features/auth/AuthenticationPage";
import { InstructorProtectedRoute } from "@/features/auth/InstructorProtectedRoute";
import { UserProtectedRoute } from "@/features/auth/UserProtectedRoute";
import AcceptInvitationPage from "@/features/cohorts/Pages/AcceptInvitationPage";
import CohortMembersPage from "@/features/cohorts/Pages/CohortMembersPage";
import CohortTasksPage from "@/features/cohorts/Pages/CohortTasksPage";
import { CohortDetails } from "@/features/cohorts/Pages/CohortDetailsPage";
import { CohortsRegistrationPage } from "@/features/cohorts/Pages/CohortsPage";
import CreateCohortPage from "@/features/cohorts/Pages/CreateCohortPage";
import { InstructorCohortsPage } from "@/features/cohorts/Pages/InsrtuctorCohortPage";
import StudentCohortsPage from "@/features/cohorts/Pages/StudentCohortsPage";
import CourseBuilderPage from "@/features/courses/pages/CourseBuilderPage";
import CreateCoursePage from "@/features/courses/pages/CreateCoursePage";
import InstructorCoursesPage from "@/features/courses/pages/InstructorCoursesPage";
import LessonEditorPage from "@/features/courses/pages/LessonEditorPage";
import { StudentDashboardPage } from "@/features/dashboard/pages/StudentDashboardPage";
import { InstructorDashboardPage } from "@/features/dashboard/pages/InstructorDashboardPage";
import { Home } from "@/features/home/pages/HomePage";
import { LecturePage } from "@/features/lectures/pages/LecturePage";
import InstructorSessionsPage from "@/features/live/pages/InstructorSessionsPage";
import { LiveRoomPage } from "@/features/live/pages/LiveRoomPage";
import { StudentSessionsPage } from "@/features/live/pages/StudentSessionsPage";
import { StudentSessionHistoryPage } from "@/features/live/pages/StudentSessionHistoryPage";
import { LegalPage } from "@/features/legal/pages/LegalPage";
import InstructorSettingsPage from "@/features/settings/pages/InstructorSettingsPage";
import StudentSettingsPage from "@/features/settings/pages/StudentSettingsPage";
import { ComingSoonPage } from "@/features/system/pages/ComingSoonPage";
import { NotFoundPage } from "@/features/system/pages/NotFoundPage";
import AllTasksPage from "@/features/tasks/pages/AllTasksPage";
import CohortTaskEditorPage from "@/features/tasks/pages/CohortTaskEditorPage";
import TaskEditorPage from "@/features/tasks/pages/TaskEditorPage";
import TaskTestPage from "@/features/tasks/pages/TaskTestPage";
import { AssignmentGroundPage } from "@/features/assignments/pages/AssignmentGroundPage";
import { AssignmentsPage } from "@/features/assignments/pages/AssignmentsPage";
import { LegacyStudentTaskRedirect } from "@/features/assignments/pages/LegacyStudentTaskRedirect";
import { QuizGroundPage } from "@/features/assignments/pages/QuizGroundPage";
import { PlaygroundPage } from "@/features/workspace/pages/Playground";
import { InstructorLayout } from "@/layouts/InstructorLayout/InstructorLayout";
import { PublicLayout } from "@/layouts/PublicLayout/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout/StudentLayouts";

interface ApplicationRoutesProps {
  location: Location;
  signedIn: boolean;
}

/** The complete route manifest, grouped by the shell that owns each page. */
export function ApplicationRoutes({
  location,
  signedIn,
}: ApplicationRoutesProps) {
  return (
    <Routes location={location}>
      {/* Authentication has its own full-screen shell. */}
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/auth/forgot-password" element={<AuthPage />} />
      <Route path="/auth/reset-password" element={<AuthPage />} />
      <Route path="/instructor/login" element={<AuthPage />} />

      {/* Guests open the playground without mounting student navigation. */}
      {!signedIn && <Route path="/playground" element={<PlaygroundPage />} />}

      <Route element={<PublicLayout />}>
        <Route path="/privacy" element={<LegalPage document="privacy" />} />
        <Route path="/terms" element={<LegalPage document="terms" />} />
        {!signedIn && <Route path="/" element={<Home />} />}
        <Route path="/cohorts" element={<CohortsRegistrationPage />} />
        <Route path="/courses" element={<LecturePage />} />
        <Route
          path="/tutorials/:slug"
          element={
            <ComingSoonPage
              title="Course curriculum"
              description="Our interactive course lessons and coding challenges are being prepared. Check back soon!"
              backTo="/courses"
            />
          }
        />
        <Route path="/cohort/:id" element={<CohortDetails />} />
        {!signedIn && (
          <Route
            path="/game"
            element={
              <ComingSoonPage
                title="PlayGame Arcade"
                description="The Logixia coding arcade is being prepared. Soon you’ll be able to practise, compete, and earn XP here."
              />
            }
          />
        )}
      </Route>

      {/* Live rooms are full-screen and do not use either dashboard shell. */}
      <Route element={<UserProtectedRoute />}>
        <Route path="/live/room" element={<LiveRoomPage />} />
        <Route path="/live/room/:id" element={<LiveRoomPage />} />
        <Route path="/assignments" element={<LegacyStudentTaskRedirect />} />
        <Route
          path="/assignments/:id"
          element={<LegacyStudentTaskRedirect />}
        />
      </Route>

      {/* Instructor test mode is intentionally outside InstructorLayout. */}
      <Route element={<InstructorProtectedRoute />}>
        <Route
          path="/instructor/courses/:courseId/tasks/:taskId/test"
          element={<TaskTestPage />}
        />
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboardPage />} />
          <Route path="cohorts" element={<InstructorCohortsPage />} />
          <Route path="cohorts/new" element={<CreateCohortPage />} />
          <Route path="cohorts/:cohortId/edit" element={<CreateCohortPage />} />
          <Route path="cohort/:id" element={<CohortDetails />} />
          <Route
            path="cohorts/:cohortId/members"
            element={<CohortMembersPage />}
          />
          <Route path="cohorts/tasks" element={<CohortTasksPage />} />
          <Route
            path="cohorts/:cohortId/tasks/new"
            element={<CohortTaskEditorPage />}
          />
          <Route path="cohorts/members" element={<CohortMembersPage />} />
          <Route path="courses" element={<InstructorCoursesPage />} />
          <Route path="courses/new" element={<CreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={<CreateCoursePage />} />
          <Route
            path="courses/:courseId/builder"
            element={<CourseBuilderPage />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId"
            element={<LessonEditorPage />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/tasks/new"
            element={<TaskEditorPage />}
          />
          <Route
            path="courses/:courseId/tasks/:taskId"
            element={<TaskEditorPage />}
          />
          <Route path="tasks" element={<AllTasksPage />} />
          <Route path="sessions" element={<InstructorSessionsPage />} />
          <Route path="settings" element={<InstructorSettingsPage />} />
          <Route
            path="plan"
            element={<ComingSoonPage title="Classroom plan" backTo="/instructor" />}
          />
          <Route
            path="students"
            element={<ComingSoonPage title="Student roster" backTo="/instructor" />}
          />
          <Route
            path="students/new"
            element={<ComingSoonPage title="Register student" backTo="/instructor" />}
          />
        </Route>
      </Route>

      {/* Student pages share one persistent shell, including full-screen workspaces. */}
      <Route element={<StudentLayout />}>
        {signedIn && <Route path="/playground" element={<PlaygroundPage />} />}
        <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
        <Route element={<UserProtectedRoute />}>
          {signedIn && <Route path="/" element={<StudentDashboardPage />} />}
          <Route path="/settings" element={<StudentSettingsPage />} />
          <Route path="/student/courses" element={<LecturePage />} />
          <Route
            path="/student/tutorials/:slug"
            element={
              <ComingSoonPage
                title="Course curriculum"
                description="Our interactive course lessons and coding challenges are being prepared. Check back soon!"
                backTo="/student/courses"
              />
            }
          />
          <Route
            path="/register/cohorts"
            element={<CohortsRegistrationPage />}
          />
          <Route path="/student/cohorts" element={<StudentCohortsPage />} />
          <Route path="/student/cohort/:id" element={<CohortDetails />} />
          <Route path="/live-stream" element={<StudentSessionsPage />} />
          <Route
            path="/lessons"
            element={<ComingSoonPage title="Pre-class notes" />}
          />
          <Route path="/tasks" element={<AssignmentsPage />} />
          <Route path="/tasks/:id" element={<AssignmentGroundPage />} />
          <Route path="/tasks/:id/quiz" element={<QuizGroundPage />} />
          <Route path="/history" element={<StudentSessionHistoryPage />} />
          <Route
            path="/schedule"
            element={<ComingSoonPage title="Class timetable" />}
          />
          <Route
            path="/game"
            element={
              <ComingSoonPage
                title="PlayGame Arcade"
                description="The Logixia coding arcade is being prepared. Soon you’ll be able to practise, compete, and earn XP here."
              />
            }
          />
        </Route>
      </Route>

      {/* Unknown addresses must remain last so every real route wins first. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
