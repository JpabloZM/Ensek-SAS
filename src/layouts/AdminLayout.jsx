import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { EnsekLogoLink } from "../components/EnsekLogo";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="logo">
            <EnsekLogoLink to="/admin/dashboard" size="medium" />
          </div>
          <div className="nav-links">
            <Link to="/admin/dashboard">Panel de Control</Link>
            <Link to="/admin/calendario">Calendario</Link>
            <Link to="/admin/inventario">Inventario</Link>
            <Link to="/admin/administradores">Administradores</Link>
          </div>
          <div className="user-menu">
            <span>{user?.name}</span>
            <button onClick={handleLogout}>Cerrar Sesión</button>
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
