import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage =
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/registro";
  const user = JSON.parse(localStorage.getItem("usuarioActual")); // Cambiado a usuarioActual para mantener consistencia

  useEffect(() => {
    // Si no hay usuario y no estamos en una página de autenticación, redirigir a login
    if (!user && !isAuthPage) {
      navigate("/admin/login");
    }
  }, [user, isAuthPage, navigate]);

  // Renderizar solo el contenido para páginas de autenticación
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="logo">
            <Link to="/admin/dashboard">ENSEK</Link>
          </div>
          <div className="nav-links">
            <Link to="/admin/dashboard">Panel de Control</Link>
            <Link to="/admin/calendario">Calendario</Link>
            <Link to="/admin/inventario">Inventario</Link>
          </div>
          <div className="user-menu">
            <span>{user?.nombre}</span>
            <button
              onClick={() => {
                localStorage.removeItem("usuarioActual");
                navigate("/admin/login");
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
