import { AuthPage } from "./features/auth/AuthenticationPage"
import { Route, Routes } from "react-router-dom"
import StudentLayout from "./layouts/StudentLayout/StudentLayouts"
import Sidebar from "./layouts/InstructorLayout/Sidebar/Sidebar"
import { Home } from "./pages/Home/HomePage"
import { CohortsPage } from "./pages/Cohorts/CohortsPage"
import { CohortDetails } from "./pages/Cohorts/CohortDetailsPage"
import { LecturePage } from "./pages/Lectures/LecturePage"
import { AssignmentsPage } from "./pages/student/AssignmentsPage"
import { LiveSessionsPage } from "./pages/student/LiveSessionPage"
import { LiveRoomPage } from "./pages/student/LiveRoomPage"
import { PlaygroundPage } from "./pages/playground/Playground"
import { AssignmentGroundPage } from "./pages/student/AssignmentGroundPage"
import { useAuth } from "./features/auth/context/AuthContext"
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage"
import { UserProtectedRoute } from "./components/routes/UserProtectedRoute"









function App() {

  const { profile } = useAuth()

  return (


    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/playground" element={<PlaygroundPage />} />

      {/* full screen pages for student with login */}
      <Route element={<UserProtectedRoute />} >
        <Route path="/live/room" element={<LiveRoomPage />} />
        <Route path="/assignments/:id" element={<AssignmentGroundPage />} />
      </Route>

      <Route path="/instructor" element={<Sidebar />} />
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