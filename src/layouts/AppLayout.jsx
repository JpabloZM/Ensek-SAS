import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_CONFIG, hasPermissionForRoute } from "../config/routeConfig";
import "../styles/Layout.css";

export const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar permisos cada vez que cambia la ruta
    if (!loading && user) {
      if (!hasPermissionForRoute(user.role, location.pathname)) {
        // Redirigir según el rol si no tiene permisos
        const redirectPath =
          user.role === "admin"
            ? ROUTE_CONFIG.admin.dashboard
            : ROUTE_CONFIG.user.dashboard;

        navigate(redirectPath, { replace: true });
      }
    }
  }, [location.pathname, user, loading, navigate]);

  if (loading) {
    return (
      <div className="layout-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Determinar qué layout usar según la ruta y el rol del usuario
  const isPublicRoute = Object.values(ROUTE_CONFIG.public).includes(
    location.pathname
  );
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isClientRoute = location.pathname.startsWith("/cliente");

  return (
    <div className={`app-layout ${getLayoutClass()}`}>
      {/* Header común */}
      <header className="app-header">
        <nav className="nav-menu">
          {user ? (
            <>
              {user.role === "admin" ? <AdminNav /> : <ClientNav />}
              <UserMenu user={user} />
            </>
          ) : (
            <PublicNav />
          )}
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="app-main">{children}</main>

      {/* Footer común */}
      <footer className="app-footer">
        <p>&copy; 2025 ENSEK-SAS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );

  // Función auxiliar para determinar la clase del layout
  function getLayoutClass() {
    if (isPublicRoute) return "public-layout";
    if (isAdminRoute) return "admin-layout";
    if (isClientRoute) return "client-layout";
    return "default-layout";
  }
};

// Componentes de navegación
const AdminNav = () => (
  <div className="nav-links">
    <a href={ROUTE_CONFIG.admin.dashboard}>Calendario</a>
    <a href={ROUTE_CONFIG.admin.inventory}>Inventario</a>
    <a href={ROUTE_CONFIG.admin.services}>Servicios</a>
    <a href={ROUTE_CONFIG.admin.users}>Usuarios</a>
    <a href={ROUTE_CONFIG.admin.technicians}>Técnicos</a>
    <a href={ROUTE_CONFIG.admin.reports}>Reportes</a>
  </div>
);

const ClientNav = () => (
  <div className="nav-links">
    <a href={ROUTE_CONFIG.user.dashboard}>Inicio</a>
    <a href={ROUTE_CONFIG.user.services}>Mis Servicios</a>
    <a href={ROUTE_CONFIG.user.requestService}>Solicitar Servicio</a>
  </div>
);

const PublicNav = () => (
  <div className="nav-links">
    <a href={ROUTE_CONFIG.public.home}>Inicio</a>
    <a href={ROUTE_CONFIG.public.login}>Iniciar Sesión</a>
    <a href={ROUTE_CONFIG.public.register}>Registrarse</a>
  </div>
);

const UserMenu = ({ user }) => (
  <div className="user-menu">
    <span>Bienvenido, {user.name}</span>
    <div className="user-dropdown">
      <a
        href={
          user.role === "admin"
            ? ROUTE_CONFIG.admin.profile
            : ROUTE_CONFIG.user.profile
        }
      >
        Mi Perfil
      </a>
      <button
        onClick={() => {
          /* Implementar logout */
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  </div>
);
