import { Link, Outlet } from "react-router-dom";
import { FaFacebook, FaInstagram, FaBars } from "react-icons/fa";
import { useState } from "react";
import "./ClientLayout.css";

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="layout">
      <header className="navbar">
        <button className="menu-button" onClick={toggleMenu}>
          <FaBars />
        </button>

        <div className="navbar-logo">
          <Link to="/">ENSEK</Link>
        </div>

        <nav className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Inicio
          </Link>
          <Link to="/servicios" onClick={() => setIsMenuOpen(false)}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>
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
