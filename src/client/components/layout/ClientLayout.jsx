import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars, FaArrowUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/images/Logo-removebg.png";
import "./ClientLayout.css";

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Removed the redundant authentication check here since AuthRoute handles it

  // Cerrar el menú cuando cambie la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Controlar la visibilidad del botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      // Para depuración: Mostrar la posición actual del scroll en la consola
      console.log("ScrollY:", window.scrollY);

      if (window.scrollY > 150) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    // Ejecutar la función una vez al principio para detectar la posición actual
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Para depuración: mostrar el estado actual del botón en la consola
  useEffect(() => {
    console.log("showScrollTop:", showScrollTop);
  }, [showScrollTop]);

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

  // Función para volver arriba suavemente
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="client-layout">
      {/* Botón flotante para volver arriba - Colocado al principio del componente para evitar conflictos */}
      <button
        className="scroll-to-top-btn"
        onClick={scrollToTop}
        title="Volver arriba"
        style={{
          display: showScrollTop ? "flex" : "none",
        }}
      >
        <FaArrowUp />
      </button>

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
              <span
                className="client-name"
                style={{ fontWeight: 500, marginRight: "0.75rem" }}
              >
                {user.name}
              </span>
              <button onClick={handleLogout} className="login-button">
                Cerrar sesión
              </button>
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
                  <Link to="/app">Inicio</Link>
                </li>
                <li>
                  <Link to="/app/servicios">Servicios</Link>
                </li>
                <li>
                  <button className="contact-link" onClick={handleContactClick}>
                    Contacto
                  </button>
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

      {/* Eliminado el botón duplicado al final del componente */}
    </div>
  );
};

export default ClientLayout;
