import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Bienvenido a ENSEK</h1>
          <p>
            Servicios especializados en manejo integrado de plagas y jardineria.
          </p>
          <div className="cta-buttons">
            <Link to="/servicios" className="cta-button primary">
              Nuestros Servicios
            </Link>
            <Link to="/contacto" className="cta-button secondary">
              Contáctanos
            </Link>
          </div>
        </div>
      </div>

      <section className="features">
        <h2>¿Por qué elegirnos?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-check-circle"></i>
            <h3>Experiencia</h3>
            <p>8 años en el sector</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock"></i>
            <h3>Puntualidad</h3>
            <p>Cumplimos con los tiempos acordados</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-star"></i>
            <h3>Calidad</h3>
            <p>Servicio garantizado</p>
          </div>
        </div>
      </section>

      <section className="">
        <h2>Contactanos</h2>
      </section>
    </div>
  );
};

export default Home;
