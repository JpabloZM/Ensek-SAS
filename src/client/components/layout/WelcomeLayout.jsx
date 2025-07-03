import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import "./WelcomeLayout.css";
import "./logo-styles.css";
import EnsekLogo, { EnsekLogoLink } from "../../../components/EnsekLogo";

const WelcomeLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
  return (
    <div className="welcome-layout">
      <header className="navbar">
        <button
          className="menu-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <FaBars style={{ color: "white" }} />
        </button>
        <div className="navbar-logo">
          <Link to="/welcome" className="logo-link">
            <div className="logo-container">
              <EnsekLogo size="medium" className="navbar-logo-component" />
              <span className="logo-text">ENSEK</span>
            </div>
          </Link>
        </div>
        <nav className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/welcome">Inicio</Link>
          <Link to="/welcome/servicios">Servicios</Link>
          <Link to="/login" className="auth-button login">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="auth-button register">
            Registrarse
          </Link>
        </nav>
        <div
          className="navbar-icons"
          style={{ display: "flex", alignItems: "center" }}
        >
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

      <main className="welcome-main">
        <Outlet />
      </main>

      <footer className="welcome-footer">
        <div className="welcome-container">
          {" "}
          <div className="welcome-footer-content">
            {" "}
            <div className="welcome-footer-logo">
              <EnsekLogo size="large" className="footer-logo-component" />
              <h2>
                ENSEK <span>SAS</span>
              </h2>
              <p>
                Manejo integrado de plagas, jardineria <br></br> y paisajismo.
              </p>
            </div>
            <div className="welcome-footer-links">
              <h3>Enlaces</h3>
              <ul>
                <li>
                  <Link to="/welcome">Inicio</Link>
                </li>
                <li>
                  <Link to="/welcome/servicios">Servicios</Link>
                </li>{" "}
                <li>
                  <Link to="/login" className="footer-auth-link">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/registro" className="footer-auth-link">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div className="welcome-footer-contact">
              <h3>Contacto</h3>
              <p>Email: directorcomercial.enske@gmail.com</p>
              <p>Teléfono: (604) 322 85 33 - 323 902 50 53</p>
              <p>Dirección: Carrera 55b #15-58, Rionegro - Antioquia</p>
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

export default WelcomeLayout;
