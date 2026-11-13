import { Suspense, lazy } from "react";
import type { Location } from "react-router-dom";
import { Navigate, Route, Routes } from "react-router-dom";

import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { AuthPage } from "@/features/auth/AuthenticationPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { InstructorProtectedRoute } from "@/features/auth/InstructorProtectedRoute";
import { UserProtectedRoute } from "@/features/auth/UserProtectedRoute";
import AcceptInvitationPage from "@/features/cohorts/Pages/AcceptInvitationPage";
import CohortMembersPage from "@/features/cohorts/Pages/CohortMembersPage";
import StudentManagementPage from "@/features/students/pages/StudentManagementPage";
import CohortTasksPage from "@/features/cohorts/Pages/CohortTasksPage";
import { CohortDetails } from "@/features/cohorts/Pages/CohortDetailsPage";
import { CohortsRegistrationPage } from "@/features/cohorts/Pages/CohortsPage";
import CreateCohortPage from "@/features/cohorts/Pages/CreateCohortPage";
import { InstructorCohortsPage } from "@/features/cohorts/Pages/InsrtuctorCohortPage";
import StudentCohortsPage from "@/features/cohorts/Pages/StudentCohortsPage";
import { CohortLeaderboardPage } from "@/features/cohorts/Pages/CohortLeaderboardPage";
import CreateCoursePage from "@/features/courses/pages/CreateCoursePage";
import InstructorCoursesPage from "@/features/courses/pages/InstructorCoursesPage";
import { StudentDashboardPage } from "@/features/dashboard/pages/StudentDashboardPage";
import { DailyChallengePage } from "@/features/dashboard/pages/DailyChallengePage";
import { InstructorDashboardPage } from "@/features/dashboard/pages/InstructorDashboardPage";
import { HomePage } from "@/features/home";
import { LecturePage } from "@/features/lectures/pages/LecturePage";
import InstructorSessionsPage from "@/features/live/pages/InstructorSessionsPage";
import { StudentSessionsPage } from "@/features/live/pages/StudentSessionsPage";
import { StudentSessionHistoryPage } from "@/features/live/pages/StudentSessionHistoryPage";
import { LegalPage } from "@/features/legal/pages/LegalPage";
import InstructorSettingsPage from "@/features/settings/pages/InstructorSettingsPage";
import StudentSettingsPage from "@/features/settings/pages/StudentSettingsPage";
import { ComingSoonPage } from "@/features/system/pages/ComingSoonPage";
import { NotFoundPage } from "@/features/system/pages/NotFoundPage";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import AllTasksPage from "@/features/tasks/pages/AllTasksPage";
import { AssignmentsPage } from "@/features/assignments/pages/AssignmentsPage";
import { LegacyStudentTaskRedirect } from "@/features/assignments/pages/LegacyStudentTaskRedirect";
import { InstructorLayout } from "@/layouts/InstructorLayout/InstructorLayout";
import { PublicLayout } from "@/layouts/PublicLayout/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout/StudentLayouts";

// Lazy-load only heavy editor, workspace, live-room, and arcade pages so
// regular navigation never flashes a loading screen.
const CourseBuilderPage = lazy(
  () => import("@/features/courses/pages/CourseBuilderPage"),
);
const LessonEditorPage = lazy(
  () => import("@/features/courses/pages/LessonEditorPage"),
);
const LiveRoomPage = lazy(() =>
  import("@/features/live/pages/LiveRoomPage").then((m) => ({
    default: m.LiveRoomPage,
  })),
);
const SessionPlayerPage = lazy(
  () => import("@/features/live/pages/SessionPlayerPage"),
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
    <Suspense fallback={<ListPageSkeleton label="Loading page" />}>
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
