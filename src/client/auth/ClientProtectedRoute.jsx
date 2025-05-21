import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ClientProtectedRoute = ({ children, requiredRole = "user" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While authentication state is loading, show a loading indicator
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // If no user or token exists, redirect to login
  if (!user || !user.token) {
    console.log("ClientProtectedRoute: No authenticated user, redirecting to login");
    // Keep track of where they were trying to go for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role - user or admin can access client routes
  if (requiredRole === "user" && user.role !== "user" && user.role !== "admin") {
    console.log(`ClientProtectedRoute: User role ${user.role} not authorized for client area`);
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and authorized
  console.log("ClientProtectedRoute: User authorized, rendering protected content");
  return children;
};

export default ClientProtectedRoute;
