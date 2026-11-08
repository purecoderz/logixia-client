import { AppLoading } from "../../components/ui/AppLoading";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export function UserProtectedRoute() {
  const { profile, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the session check so logged-in users don't flash to /login
  if (isLoading) {
    return <AppLoading message="Checking your session…" />;
  }

  if (!profile) {
    // Remember where they were trying to go
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
