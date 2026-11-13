import { Suspense, lazy } from "react";
import type { Location } from "react-router-dom";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLoading } from "@/components/ui/AppLoading";
import { InstructorProtectedRoute } from "@/features/auth/InstructorProtectedRoute";
import { UserProtectedRoute } from "@/features/auth/UserProtectedRoute";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { InstructorLayout } from "@/layouts/InstructorLayout/InstructorLayout";
import { PublicLayout } from "@/layouts/PublicLayout/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout/StudentLayouts";

const AuthPage = lazy(() =>
  import("@/features/auth/AuthenticationPage").then((m) => ({
    default: m.AuthPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const AcceptInvitationPage = lazy(
  () => import("@/features/cohorts/Pages/AcceptInvitationPage"),
);
const CohortMembersPage = lazy(
  () => import("@/features/cohorts/Pages/CohortMembersPage"),
);
const StudentManagementPage = lazy(
  () => import("@/features/students/pages/StudentManagementPage"),
);
const CohortTasksPage = lazy(
  () => import("@/features/cohorts/Pages/CohortTasksPage"),
);
const CohortDetails = lazy(() =>
  import("@/features/cohorts/Pages/CohortDetailsPage").then((m) => ({
    default: m.CohortDetails,
  })),
);
const CohortsRegistrationPage = lazy(() =>
  import("@/features/cohorts/Pages/CohortsPage").then((m) => ({
    default: m.CohortsRegistrationPage,
  })),
);
const CreateCohortPage = lazy(
  () => import("@/features/cohorts/Pages/CreateCohortPage"),
);
const InstructorCohortsPage = lazy(() =>
  import("@/features/cohorts/Pages/InsrtuctorCohortPage").then((m) => ({
    default: m.InstructorCohortsPage,
  })),
);
const StudentCohortsPage = lazy(
  () => import("@/features/cohorts/Pages/StudentCohortsPage"),
);
const CohortLeaderboardPage = lazy(() =>
  import("@/features/cohorts/Pages/CohortLeaderboardPage").then((m) => ({
    default: m.CohortLeaderboardPage,
  })),
);
const CourseBuilderPage = lazy(
  () => import("@/features/courses/pages/CourseBuilderPage"),
);
const CreateCoursePage = lazy(
  () => import("@/features/courses/pages/CreateCoursePage"),
);
const InstructorCoursesPage = lazy(
  () => import("@/features/courses/pages/InstructorCoursesPage"),
);
const LessonEditorPage = lazy(
  () => import("@/features/courses/pages/LessonEditorPage"),
);
const StudentDashboardPage = lazy(() =>
  import("@/features/dashboard/pages/StudentDashboardPage").then((m) => ({
    default: m.StudentDashboardPage,
  })),
);
const DailyChallengePage = lazy(() =>
  import("@/features/dashboard/pages/DailyChallengePage").then((m) => ({
    default: m.DailyChallengePage,
  })),
);
const InstructorDashboardPage = lazy(() =>
  import("@/features/dashboard/pages/InstructorDashboardPage").then((m) => ({
    default: m.InstructorDashboardPage,
  })),
);
const HomePage = lazy(() =>
  import("@/features/home").then((m) => ({ default: m.HomePage })),
);
const LecturePage = lazy(() =>
  import("@/features/lectures/pages/LecturePage").then((m) => ({
    default: m.LecturePage,
  })),
);
const InstructorSessionsPage = lazy(
  () => import("@/features/live/pages/InstructorSessionsPage"),
);
const LiveRoomPage = lazy(() =>
  import("@/features/live/pages/LiveRoomPage").then((m) => ({
    default: m.LiveRoomPage,
  })),
);
const StudentSessionsPage = lazy(() =>
  import("@/features/live/pages/StudentSessionsPage").then((m) => ({
    default: m.StudentSessionsPage,
  })),
);
const StudentSessionHistoryPage = lazy(() =>
  import("@/features/live/pages/StudentSessionHistoryPage").then((m) => ({
    default: m.StudentSessionHistoryPage,
  })),
);
const SessionPlayerPage = lazy(
  () => import("@/features/live/pages/SessionPlayerPage"),
);
const LegalPage = lazy(() =>
  import("@/features/legal/pages/LegalPage").then((m) => ({
    default: m.LegalPage,
  })),
);
const InstructorSettingsPage = lazy(
  () => import("@/features/settings/pages/InstructorSettingsPage"),
);
const StudentSettingsPage = lazy(
  () => import("@/features/settings/pages/StudentSettingsPage"),
);
const ComingSoonPage = lazy(() =>
  import("@/features/system/pages/ComingSoonPage").then((m) => ({
    default: m.ComingSoonPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/features/system/pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);
const AllTasksPage = lazy(
  () => import("@/features/tasks/pages/AllTasksPage"),
);
const CohortTaskEditorPage = lazy(
  () => import("@/features/tasks/pages/CohortTaskEditorPage"),
);
const TaskEditorPage = lazy(
  () => import("@/features/tasks/pages/TaskEditorPage"),
);
const TaskTestPage = lazy(
  () => import("@/features/tasks/pages/TaskTestPage"),
);
const AssignmentGroundPage = lazy(() =>
  import("@/features/assignments/pages/AssignmentGroundPage").then((m) => ({
    default: m.AssignmentGroundPage,
  })),
);
const AssignmentsPage = lazy(() =>
  import("@/features/assignments/pages/AssignmentsPage").then((m) => ({
    default: m.AssignmentsPage,
  })),
);
const LegacyStudentTaskRedirect = lazy(() =>
  import("@/features/assignments/pages/LegacyStudentTaskRedirect").then(
    (m) => ({ default: m.LegacyStudentTaskRedirect }),
  ),
);
const QuizGroundPage = lazy(() =>
  import("@/features/assignments/pages/QuizGroundPage").then((m) => ({
    default: m.QuizGroundPage,
  })),
);
const ArcadeHubPage = lazy(() =>
  import("@/features/arcade/pages/ArcadeHubPage").then((m) => ({
    default: m.ArcadeHubPage,
  })),
);
const PlaygroundPage = lazy(() =>
  import("@/features/workspace/pages/Playground").then((m) => ({
    default: m.PlaygroundPage,
  })),
);

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
    <Suspense fallback={<AppLoading message="Loading…" />}>
      <Routes location={location}>
      {/* Authentication has its own full-screen shell. */}
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/auth/forgot-password" element={<AuthPage />} />
      <Route path="/auth/reset-password" element={<AuthPage />} />
      <Route path="/password" element={<ResetPasswordPage />} />
      <Route path="/instructor/login" element={<AuthPage />} />

      {/* Guests open the playground without mounting student navigation. */}
      {!signedIn && <Route path="/playground" element={<PlaygroundPage />} />}

      {/* The landing page owns its header and footer. */}
      {!signedIn && (
        <Route
          path="/"
          element={
            <ThemeProvider>
              <HomePage />
            </ThemeProvider>
          }
        />
      )}

      <Route element={<PublicLayout />}>
        <Route path="/privacy" element={<LegalPage document="privacy" />} />
        <Route path="/terms" element={<LegalPage document="terms" />} />
        <Route path="/cohorts" element={<Navigate to="/#classroom" replace />} />
        <Route path="/courses" element={<Navigate to="/#learning" replace />} />
        <Route path="/cohort/:id" element={<CohortDetails />} />
      </Route>

      {/* Live rooms are full-screen and do not use either dashboard shell. */}
      <Route element={<UserProtectedRoute />}>
        <Route path="/live/room" element={<LiveRoomPage />} />
        <Route path="/live/room/:id" element={<LiveRoomPage />} />
        <Route path="/sessions/watch" element={<SessionPlayerPage />} />
        <Route path="/sessions/:sessionId/watch" element={<SessionPlayerPage />} />
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
            element={<Navigate to="/instructor/sessions" replace />}
          />
          <Route path="students" element={<StudentManagementPage />} />
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
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/settings" element={<StudentSettingsPage />} />
          <Route path="/student/courses" element={<LecturePage />} />
          <Route
            path="/register/cohorts"
            element={<CohortsRegistrationPage />}
          />
          <Route path="/student/cohorts" element={<StudentCohortsPage />} />
          <Route path="/student/cohort/:id" element={<CohortDetails />} />
          <Route path="/live-stream" element={<StudentSessionsPage />} />
          <Route
            path="/lessons"
            element={<ComingSoonPage title="Learning path" />}
          />
          <Route path="/tasks" element={<AssignmentsPage />} />
          <Route path="/tasks/:id" element={<AssignmentGroundPage />} />
          <Route path="/tasks/:id/quiz" element={<QuizGroundPage />} />
          <Route path="/history" element={<StudentSessionHistoryPage />} />
          <Route path="/leaderboard" element={<CohortLeaderboardPage />} />
          <Route
            path="/schedule"
            element={<Navigate to="/live-stream" replace />}
          />
          <Route path="/game" element={<ArcadeHubPage />} />
        </Route>
      </Route>

      {/* Unknown addresses must remain last so every real route wins first. */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
