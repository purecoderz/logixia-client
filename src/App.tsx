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




function App() {

  const { profile } = useAuth()

  return (


    <Routes>
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/playground" element={<PlaygroundPage />} />

      {/* full screen pages for student with login */}
      <Route element={<UserProtectedRoute />} >
        <Route path="/live/room" element={<LiveRoomPage />} />
        <Route path="/assignments/:id" element={<AssignmentGroundPage />} />
      </Route>

      {/* Instructor pages */}
      <Route path="/instructor" element={<InstructorLayout />} >
        <Route path="cohorts" element={<InstructorCohortsPage/>} />
        <Route path="cohorts/new" element={<h1>Testing page</h1>} />
        <Route path="courses" element={<h1>Testing page</h1>} />
        <Route path="courses/new" element={<h1>Testing page</h1>} />
        <Route path="plan" element={<h1>Testing page</h1>} />





      </Route>




    {/* student pages routes */}
      <Route element={<StudentLayout />} >

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

      </Route>
    </Routes>
  )
}

export default App