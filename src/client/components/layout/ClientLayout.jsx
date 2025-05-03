import { Outlet, Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import "./ClientLayout.css";

const ClientLayout = () => {
  return (
    <div className="client-layout">
      <header className="client-header">
        <nav className="client-nav">
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
          </div>
          <div className="nav-buttons">
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Nuestros Servicios</Link>
            <Link to="/agenda">Agenda tu Servicio</Link>
            <Link to="/contacto">Contáctanos</Link>
          </div>
        </nav>
      </header>

      <main className="client-main">
        <Outlet />
      </main>

      <footer className="client-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>Teléfono: (123) 456-7890</p>
            <p>Email: info@ensek.com</p>
          </div>
          <div className="footer-section">
            <h4>Horario</h4>
            <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
            <p>Sábados: 9:00 AM - 2:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ENSEK. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
