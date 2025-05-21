import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole = "admin" }) => {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, redirigir al login
    return <Navigate to="/admin/login" replace />;
  }

  // Validar el rol del usuario
  if (requiredRole && user.role !== requiredRole) {
    // Si el usuario no tiene el rol requerido, redirigir
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
