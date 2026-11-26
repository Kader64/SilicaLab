import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );
}

export function RequireAuth({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "Admin" ? "/admin" : "/courses";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return <FullPageSpinner />;

  if (user) {
    const destination =
      user.role === "Admin"
        ? "/admin"
        : user.role === "Teacher"
          ? "/teach/courses"
          : "/courses";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}