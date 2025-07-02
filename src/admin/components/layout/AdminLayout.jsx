import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/images/Logo-removebg.png";
import { FaMoon, FaSun } from "react-icons/fa";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const isAuthPage =
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/registro";

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Update localStorage and apply theme whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem("admin-theme", "dark");
      document.body.classList.add("dark-theme");
    } else {
      localStorage.setItem("admin-theme", "light");
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  // Cleanup effect: remove dark-theme class from body when component unmounts
  useEffect(() => {
    // Cuando el componente se desmonte, eliminar la clase dark-theme del body
    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, []);

  // Removed authentication checks since they're now handled by AuthRoute

  // Renderizar solo el contenido para páginas de autenticación
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className={`admin-layout ${darkMode ? "dark-theme" : "light-theme"}`}>
      <header className={`admin-header ${darkMode ? "dark-theme" : ""}`}>
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
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={
                darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="logout-btn"
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
        <Outlet context={{ darkMode }} />
      </main>
    </div>
  );
};

export default AdminLayout;
