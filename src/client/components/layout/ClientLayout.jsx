import { Link, Outlet, useLocation } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import "./ClientLayout.css";

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
    <div className="layout">
      <header className="navbar">
        <button
          className="menu-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <FaBars />
        </button>

        <div className="navbar-logo">
          <Link to="/" onClick={handleLinkClick}>
            ENSEK
          </Link>
        </div>

        <nav className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" onClick={handleLinkClick}>
            Inicio
          </Link>
          <Link to="/servicios" onClick={handleLinkClick}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={handleLinkClick}>
            Contacto
          </Link>
        </nav>

        <div className="navbar-icons">
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
    </div>
  );
};

export default ClientLayout;
