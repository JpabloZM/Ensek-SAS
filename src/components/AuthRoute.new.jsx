import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ROUTE_CONFIG,
  isProtectedRoute,
  hasPermissionForRoute,
  UNAUTHORIZED_REDIRECTS,
} from "../config/routeConfig";
import { useEffect } from "react";

const LoadingSpinner = () => (
  <div className="auth-loading">
    <div className="spinner"></div>
    <p>Verificando autenticación...</p>
  </div>
);

export const AuthRoute = ({ component: Component }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    // Logging para debugging
    console.log("AuthRoute State:", {
      path: currentPath,
      isProtected: isProtectedRoute(currentPath),
      userRole: user?.role,
      loading,
      timestamp: new Date().toISOString(),
    });
  }, [currentPath, user, loading]);

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  // Verificar si la ruta requiere autenticación
  if (isProtectedRoute(currentPath)) {
    // Usuario no autenticado
    if (!user) {
      console.log("Redirigiendo a login - Usuario no autenticado");
      return (
        <Navigate
          to={ROUTE_CONFIG.public.login}
          state={{
            from: location,
            serviceType:
              location.state?.serviceType ||
              new URLSearchParams(location.search).get("serviceType"),
          }}
          replace
        />
      );
    }

    // Usuario autenticado pero sin permisos para la ruta
    if (!hasPermissionForRoute(user.role, currentPath)) {
      console.warn("Usuario sin permisos para acceder a " + currentPath);

      // Redirigir al dashboard correspondiente según el rol
      const redirectPath =
        UNAUTHORIZED_REDIRECTS[user.role] || UNAUTHORIZED_REDIRECTS.default;

      return <Navigate to={redirectPath} replace />;
    }
  } else {
    // Manejar rutas de autenticación cuando el usuario ya está logueado
    if (
      user &&
      (currentPath === ROUTE_CONFIG.public.login ||
        currentPath === ROUTE_CONFIG.public.register)
    ) {
      const defaultRedirect =
        UNAUTHORIZED_REDIRECTS[user.role] || ROUTE_CONFIG.public.home;
      return <Navigate to={defaultRedirect} replace />;
    }
  }

  // La ruta es pública o el usuario tiene los permisos necesarios
  return <Component />;
};

// HOC para proteger rutas específicas
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return (props) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return (
        <Navigate
          to={ROUTE_CONFIG.public.login}
          state={{ from: location }}
          replace
        />
      );
    }

    if (requiredRole && user.role !== requiredRole) {
      const redirectPath =
        UNAUTHORIZED_REDIRECTS[user.role] || ROUTE_CONFIG.public.home;
      return <Navigate to={redirectPath} replace />;
    }

    return <WrappedComponent {...props} />;
  };
};
