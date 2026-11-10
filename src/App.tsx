import InstructorSessionsPage from "./features/live/pages/InstructorSessionsPage";
import CohortTasksPage from "./features/cohorts/Pages/CohortTasksPage";
import { LegacyStudentTaskRedirect } from "./features/assignments/pages/LegacyStudentTaskRedirect";
import StudentSettingsPage from "./features/settings/pages/StudentSettingsPage";
import { AppLoading } from "./components/ui/AppLoading";
import { LegalPage } from "./features/legal/pages/LegalPage";
import { PublicHeader } from "./layouts/PublicLayout/PublicHeader";
import {
  NavigationMotionContext,
  useNavigationTransition,
} from "./layouts/navigation/NavigationMotion";
import TaskTestPage from "./features/tasks/pages/TaskTestPage";
import TaskEditorPage from "./features/tasks/pages/TaskEditorPage";
import InstructorSettingsPage from "./features/settings/pages/InstructorSettingsPage";
import AcceptInvitationPage from "./features/cohorts/Pages/AcceptInvitationPage";
import CohortMembersPage from "./features/cohorts/Pages/CohortMembersPage";
import CreateCohortPage from "./features/cohorts/Pages/CreateCohortPage";
import { AuthPage } from "./features/auth/AuthenticationPage";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout/PublicLayout";
import StudentLayout from "./layouts/StudentLayout/StudentLayouts";
import { Home } from "./features/home/pages/HomePage";

import { CohortDetails } from "./features/cohorts/Pages/CohortDetailsPage";
import { LecturePage } from "./features/lectures/pages/LecturePage";
import { AssignmentsPage } from "./features/assignments/pages/AssignmentsPage";
import { StudentSessionsPage } from "./features/live/pages/StudentSessionsPage";
import { LiveRoomPage } from "./features/live/pages/LiveRoomPage";
import { PlaygroundPage } from "./features/workspace/pages/Playground";
import { AssignmentGroundPage } from "./features/assignments/pages/AssignmentGroundPage";
import { QuizGroundPage } from "./features/assignments/pages/QuizGroundPage";
import { useAuth } from "./features/auth/context/AuthContext";
import { StudentDashboardPage } from "./features/dashboard/pages/StudentDashboardPage";
import { UserProtectedRoute } from "./features/auth/UserProtectedRoute";
import { InstructorLayout } from "./layouts/InstructorLayout/InstructorLayout";
import { InstructorCohortsPage } from "./features/cohorts/Pages/InsrtuctorCohortPage";
import { CohortsRegistrationPage } from "./features/cohorts/Pages/CohortsPage";
import StudentCohortsPage from "./features/cohorts/Pages/StudentCohortsPage";
import InstructorCoursesPage from "./features/courses/pages/InstructorCoursesPage";
import CreateCoursePage from "./features/courses/pages/CreateCoursePage";
import CourseBuilderPage from "./features/courses/pages/CourseBuilderPage";
import LessonEditorPage from "./features/courses/pages/LessonEditorPage";
import AllTasksPage from "./features/tasks/pages/AllTasksPage";

function App() {
  const { profile, isLoading } = useAuth();
  const { displayedLocation, motion } = useNavigationTransition(!!profile);

  if (isLoading && displayedLocation.pathname === "/")
    return <AppLoading message="Checking your session…" />;

  return (
    <NavigationMotionContext value={motion}>
      <Routes location={displayedLocation}>
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/signup" element={<AuthPage />} />
        {!profile && <Route path="/playground" element={<PlaygroundPage />} />}
        {/* Public browsing shares one navigation shell, with or without an account. */}
        <Route element={<PublicLayout />}>
          <Route path="/privacy" element={<LegalPage document="privacy" />} />
          <Route path="/terms" element={<LegalPage document="terms" />} />
          {!profile && <Route path="/" element={<Home />} />}
          <Route path="/cohorts" element={<CohortsRegistrationPage />} />
          <Route path="/courses" element={<LecturePage />} />
          <Route path="/cohort/:id" element={<CohortDetails />} />
        </Route>tester1

        {/* full screen pages for student with login */}
        <Route element={<UserProtectedRoute />}>
          <Route
            path="/instructor/courses/:courseId/tasks/:taskId/test"
            element={<TaskTestPage />}
          />
          <Route path="/live/room" element={<LiveRoomPage />} />
          <Route path="/live/room/:id" element={<LiveRoomPage />} />
          <Route path="/tasks/:id" element={<AssignmentGroundPage />} />
          <Route
            path="/assignments/:id"
            element={<LegacyStudentTaskRedirect />}
          />
          <Route path="/assignments" element={<LegacyStudentTaskRedirect />} />
        </Route>

        {/* Instructor pages */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route path="cohorts" element={<InstructorCohortsPage />} />
          <Route path="cohorts/new" element={<CreateCohortPage />} />
          <Route path="cohorts/:cohortId/edit" element={<CreateCohortPage />} />
          <Route path="/instructor/cohort/:id" element={<CohortDetails />} />

          <Route
            path="cohorts/:cohortId/members"
            element={<CohortMembersPage />}
          />
          <Route path="cohorts/tasks" element={<CohortTasksPage />} />
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
          <Route element={<UserProtectedRoute />}><Route path="sessions" element={<InstructorSessionsPage />} /></Route>
          <Route element={<UserProtectedRoute />}>
            <Route path="settings" element={<InstructorSettingsPage />} />
          </Route>
          <Route path="plan" element={<h1>Testing page</h1>} />
        </Route>

        {/* student pages routes */}
        <Route element={<StudentLayout />}>
          {profile && <Route path="/playground" element={<PlaygroundPage />} />}
          <Route
            path="/invitations/accept"
            element={<AcceptInvitationPage />}
          />

          <Route element={<UserProtectedRoute />}>
            <Route path="/settings" element={<StudentSettingsPage />} />
            <Route path="/student/courses" element={<LecturePage />} />
            <Route path="/register/cohorts" element={<CohortsRegistrationPage />} />
            <Route path="/student/cohorts" element={<StudentCohortsPage />} />
            <Route path="/student/cohort/:id" element={<CohortDetails />} />
            <Route path="/live-stream" element={<StudentSessionsPage />} />
            <Route path="/lessons" element={<h1>Hello</h1>} />
            <Route path="/tasks" element={<AssignmentsPage />} />
            <Route path="/tasks/:id/quiz" element={<QuizGroundPage />} />
            <Route
              path="/history"
              element={<h1>This is the history Page</h1>}
            />
            <Route path="/schedule" element={<h1>This is timetable</h1>} />
          </Route>

          {profile && <Route index element={<StudentDashboardPage />} />}
        </Route>
      </Routes>
      {motion === "public-return" && (
        <div
          inert
          aria-hidden="true"
          className="playground-returning-header fixed inset-x-0 top-0 z-[110] bg-canvas text-body"
        >
          <PublicHeader />
        </div>
      )}
    </NavigationMotionContext>
  );
}

export default App;
