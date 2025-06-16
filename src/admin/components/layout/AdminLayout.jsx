import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/images/Logo-removebg.png";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage =
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/registro";

  // Removed authentication checks since they're now handled by AuthRoute

  // Renderizar solo el contenido para páginas de autenticación
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="logo">
            <Link to="/admin/calendario">
              <img src={logo} alt="ENSEK Logo" className="nav-logo" />
              <span>ENSEK</span>
            </Link>
          </div>
          <div className="nav-links">
            {/* <Link to="/admin/dashboard">Panel de Control</Link> */}
            <Link to="/admin/calendario">Calendario</Link>
            <Link to="/admin/inventario">Inventario</Link>
          </div>{" "}
          <div className="user-menu">
            <span>{user?.name}</span>
            <button
              onClick={async () => {
                await logout();
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
