import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import "./WelcomeLayout.css";
import logo from "../../../assets/images/Logo-removebg.png";

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
          <img src={logo} alt="ENSEK Logo" className="navbar-logo-image" />
          <Link
            to="/welcome"
            style={{ color: "white", textDecoration: "none" }}
          >
            ENSEK
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
              <img src={logo} alt="ENSEK Logo" className="footer-logo-image" />
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
              <p>Email: info@ensek.com</p>
              <p>Teléfono: 322 85 33 - 318 376 19 64</p>
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
