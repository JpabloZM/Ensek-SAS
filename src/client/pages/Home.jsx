import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a ENSEK</h1>
          <p>Servicios técnicos especializados para tu hogar y empresa</p>
          <Link to="/servicios" className="cta-button">
            Ver Servicios
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <i className="fas fa-tools"></i>
          <h3>Servicios Profesionales</h3>
          <p>Técnicos certificados y con amplia experiencia</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-clock"></i>
          <h3>Atención Oportuna</h3>
          <p>Respuesta rápida y servicio eficiente</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-star"></i>
          <h3>Calidad Garantizada</h3>
          <p>Satisfacción garantizada en todos nuestros servicios</p>
        </div>
      </section>

      <section className="contact-info">
        <h2>¿Necesitas ayuda?</h2>
        <p>Contáctanos para programar un servicio</p>
        <div className="contact-details">
          <div>
            <i className="fas fa-phone"></i>
            <span>(123) 456-7890</span>
          </div>
          <div>
            <i className="fas fa-envelope"></i>
            <span>info@ensek.com</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
