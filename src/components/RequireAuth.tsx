import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole, defaultRouteForRole } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: AppRole;
}

const DEMO_MODE = true;

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { session, roles, loading } = useAuth();
  const location = useLocation();

  if (DEMO_MODE) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && !roles.includes(role)) {
    return <Navigate to={defaultRouteForRole(roles[0])} replace />;
  }

  return <>{children}</>;
}
