import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppLoading } from "@/components/ui/AppLoading";
import { useAuth } from "./context/AuthContext";

const INSTRUCTOR_ROLES = new Set(["instructor", "admin"]);

export function isInstructorRole(role?: string) {
  return role !== undefined && INSTRUCTOR_ROLES.has(role);
}

export function InstructorProtectedRoute() {
  const { profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AppLoading message="Checking instructor access…" />;

  if (!profile) {
    return (
      <Navigate
        to="/instructor/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!isInstructorRole(profile.role)) {
    return <Navigate to="/" replace state={{ instructorAccessDenied: true }} />;
  }

  return <Outlet />;
}
