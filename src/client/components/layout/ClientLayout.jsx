import { Outlet, Link } from "react-router-dom";
import "./ClientLayout.css";

const ClientLayout = () => {
  return (
    <div className="client-layout">
      <header className="client-header">
        <nav className="client-nav">
          <div className="logo">
            <Link to="/">ENSEK</Link>
          </div>
          <div className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Servicios</Link>
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
