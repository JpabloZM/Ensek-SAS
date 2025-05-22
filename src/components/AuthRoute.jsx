import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * A component that handles role-based routing in a single place
 * This replaces the separate ClientProtectedRoute and ProtectedRoute components
 * 
 * Usage:
 * <AuthRoute requiredAuth={true} allowedRoles={['admin']} redirectTo="/login">
 *   <AdminComponent />
 * </AuthRoute>
 */
const AuthRoute = ({ 
  children, 
  requiredAuth = true, 
  allowedRoles = ['user', 'admin'], 
  redirectTo = "/login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Case 1: Route requires authentication but user is not logged in
  if (requiredAuth && !user) {
    console.log('AuthRoute: Authentication required but no user found, redirecting to', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Case 2: Route requires authentication and specific roles
  if (requiredAuth && user && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.log(`AuthRoute: User role ${user.role} not in allowed roles [${allowedRoles.join(', ')}]`);
      
      // If user is logged in but with wrong role, redirect to appropriate dashboard
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/cliente" replace />;
      }
    }
  }

  // Case 3: Route is for non-authenticated users only (like login page) but user is already logged in
  if (!requiredAuth && user) {
    console.log('AuthRoute: User already authenticated, redirecting to appropriate dashboard');
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/cliente" replace />;
    }
  }

  // Default: Allow access to the route
  return children || <Outlet />;
};

export default AuthRoute;
