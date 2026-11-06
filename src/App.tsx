import TaskTestPage from "./features/tasks/pages/TaskTestPage"
import TaskEditorPage from "./features/tasks/pages/TaskEditorPage"
import InstructorSettingsPage from "./features/settings/pages/InstructorSettingsPage"
import AcceptInvitationPage from "./features/cohorts/Pages/AcceptInvitationPage"
import CohortMembersPage from "./features/cohorts/Pages/CohortMembersPage"
import CreateCohortPage from "./features/cohorts/Pages/CreateCohortPage"
import { AuthPage } from "./features/auth/AuthenticationPage"
import { Route, Routes } from "react-router-dom"
import StudentLayout from "./layouts/StudentLayout/StudentLayouts"
import { Home } from "./features/home/pages/HomePage"

import { CohortDetails } from "./features/cohorts/Pages/CohortDetailsPage"
import { LecturePage } from "./features/lectures/pages/LecturePage"
import { AssignmentsPage } from "./features/assignments/pages/AssignmentsPage"
import { LiveSessionsPage } from "./features/live/pages/LiveSessionPage"
import { LiveRoomPage } from "./features/live/pages/LiveRoomPage"
import { PlaygroundPage } from "./features/workspace/pages/Playground"
import { AssignmentGroundPage } from "./features/assignments/pages/AssignmentGroundPage"
import { useAuth } from "./features/auth/context/AuthContext"
import { StudentDashboardPage } from "./features/dashboard/pages/StudentDashboardPage"
import { UserProtectedRoute } from "./features/auth/UserProtectedRoute"
import { InstructorLayout } from "./layouts/InstructorLayout/InstructorLayout"
import { InstructorCohortsPage } from "./features/cohorts/Pages/InsrtuctorCohortPage"
import { CohortsPage } from "./features/cohorts/Pages/CohortsPage"
import InstructorCoursesPage from "./features/courses/pages/InstructorCoursesPage"
import CreateCoursePage from "./features/courses/pages/CreateCoursePage"
import CourseBuilderPage from "./features/courses/pages/CourseBuilderPage"
import LessonEditorPage from "./features/courses/pages/LessonEditorPage"
import AllTasksPage from "./features/tasks/pages/AllTasksPage"




function App() {

  const { profile } = useAuth()

  return (


    <Routes>
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/playground" element={<PlaygroundPage />} />

      {/* full screen pages for student with login */}
      <Route element={<UserProtectedRoute />} >
        <Route path="/instructor/courses/:courseId/tasks/:taskId/test" element={<TaskTestPage />} />
        <Route path="/live/room" element={<LiveRoomPage />} />
        <Route path="/assignments/:id" element={<AssignmentGroundPage />} />
      </Route>

      {/* Instructor pages */}
      <Route path="/instructor" element={<InstructorLayout />} >
        <Route path="cohorts" element={<InstructorCohortsPage/>} />
        <Route path="cohorts/new" element={<CreateCohortPage />} />
        <Route path="cohorts/:cohortId/edit" element={<CreateCohortPage />} />
        <Route path="cohorts/:cohortId/members" element={<CohortMembersPage />} />
        <Route path="cohorts/members" element={<CohortMembersPage />} />
        <Route path="courses" element={<InstructorCoursesPage/>} />
        <Route path="courses/new" element={<CreateCoursePage/>} />
        <Route path="courses/:courseId/edit" element={<CreateCoursePage/>} />
        <Route path="courses/:courseId/builder" element={<CourseBuilderPage/>} />
        <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditorPage/>} />
        <Route path="courses/:courseId/lessons/:lessonId/tasks/new" element={<TaskEditorPage />} />
        <Route path="courses/:courseId/tasks/:taskId" element={<TaskEditorPage />} />
        <Route path="tasks" element={<AllTasksPage />} />
        <Route element={<UserProtectedRoute />}><Route path="settings" element={<InstructorSettingsPage />} /></Route>
        <Route path="plan" element={<h1>Testing page</h1>} />

      </Route>




    {/* student pages routes */}
      <Route element={<StudentLayout />} >
        <Route path="/invitations/accept" element={<AcceptInvitationPage />} />

        <Route element={<UserProtectedRoute />}>
          <Route path="/live-stream" element={<LiveSessionsPage />} />
          <Route path="/lessons" element={<h1>Hello</h1>} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/history" element={<h1>This is the history Page</h1>} />
          <Route path="/schedule" element={<h1>This is timetable</h1>} />
        </Route>


        <Route index element={profile ? <StudentDashboardPage /> : <Home />} />
        <Route path="/cohorts" element={<CohortsPage />} />
        <Route path="/courses" element={<LecturePage />} />
        <Route path="/cohort/:id" element={<CohortDetails />} />
        <Route path="/user/cohorts" element={<h1>testign</h1>} />

      </Route>
    </Routes>
  )
}

export default App