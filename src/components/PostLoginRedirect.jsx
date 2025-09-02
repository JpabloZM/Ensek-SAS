import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getPostLoginRedirect } from "../config/routeConfig";

export const PostLoginRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Obtener la ruta intentada anteriormente del estado
      const intendedPath = location.state?.from?.pathname;

      // Obtener la redirección apropiada según el rol y la ruta intentada
      const redirectPath = getPostLoginRedirect(user.role, intendedPath);

      console.log("Post-login redirect:", {
        user: user.email,
        role: user.role,
        intendedPath,
        redirectPath,
      });

      // Realizar la redirección
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location]);

  return null; // Este componente no renderiza nada
};
