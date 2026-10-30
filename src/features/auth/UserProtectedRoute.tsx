import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";


export function UserProtectedRoute() {
  const {profile, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the session check so logged-in users don't flash to /login
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        Loading...
      </div>
    );
  }

  if (!profile) {
    // Remember where they were trying to go
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}