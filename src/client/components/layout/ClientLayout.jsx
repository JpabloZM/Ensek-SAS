import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/images/Logo-removebg.png";
import "./ClientLayout.css";

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Removed the redundant authentication check here since AuthRoute handles it

  // Cerrar el menú cuando cambie la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Cerrar el menú cuando la pantalla se hace más grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    // Verificar el tamaño inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector(".navbar-links");
      const button = document.querySelector(".menu-button");
      if (
        isMenuOpen &&
        nav &&
        !nav.contains(event.target) &&
        !button.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
  const handleLogout = async () => {
    await logout();
    // Redirect to public home page after logout
    navigate("/");
  };

  const handleContactClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const contactSection = document.getElementById("contact-section");
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Espera un poco para que la navegación ocurra antes de desplazarte
    } else {
      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="client-layout">
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="ENSEK Logo" className="nav-logo" />
              <span>ENSEK</span>
            </Link>
          </div>
          <button
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <FaBars />
          </button>
        </div>

        <nav className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/app" onClick={handleLinkClick}>
            Inicio
          </Link>
          <Link to="/app/servicios" onClick={handleLinkClick}>
            Servicios
          </Link>
          {/* Cambiamos el enlace de contacto para manejar la navegación */}
          <button className="contact-button" onClick={handleContactClick}>
            Contacto
          </button>
        </nav>

        <div
          className="navbar-icons"
          style={{ display: "flex", alignItems: "center" }}
        >
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="login-button"
                style={{ marginRight: "0.75rem" }}
              >
                Cerrar sesión
              </button>
              <span className="client-name" style={{ fontWeight: 500 }}>
                {user.name}
              </span>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Iniciar sesión
            </Link>
          )}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="welcome-footer">
        <div className="welcome-container">
          <div className="welcome-footer-content">
            <div className="welcome-footer-logo">
              <img src="/logo_ensek.png" alt="ENSEK Logo" />
              <h2>
                ENSEK <span>SAS</span>
              </h2>
              <p>Control de plagas y jardinería profesional</p>
            </div>
            <div className="welcome-footer-links">
              <h3>Enlaces</h3>
              <ul>
                <li>
                  <Link to="/">Inicio</Link>
                </li>
                <li>
                  <Link to="/servicios">Servicios</Link>
                </li>
                <li>
                  <Link to="/login">Iniciar Sesión</Link>
                </li>
                <li>
                  <Link to="/registro">Registrarse</Link>
                </li>
              </ul>
            </div>
            <div className="welcome-footer-contact">
              <h3>Contacto</h3>
              <p>Email: info@ensek.com</p>
              <p>Teléfono: (123) 456-7890</p>
              <p>Dirección: Calle Principal #123, Ciudad</p>
              <div className="welcome-social-icons">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
          <div className="welcome-footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} ENSEK SAS. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
