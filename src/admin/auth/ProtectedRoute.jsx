import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));

  if (!user) {
    // Si no hay usuario, redirigir al login
    return <Navigate to="/admin/login" replace />;
  }

  // Aquí podrías agregar más validaciones según los roles
  // Por ejemplo:
  // if (requiredRole && user.role !== requiredRole) {
  //   return <Navigate to="/admin/unauthorized" replace />;
  // }

  return children;
};

export default ProtectedRoute;
