import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        {/* Add particle container */}
        <div className="particles-background">
          {[...Array(50)].map((_, index) => (
            <div key={index} className="particle" />
          ))}
        </div>

        <div className="hero-content">
          <h1>Bienvenido a ENSEK</h1>
          <p>
            Servicios especializados en manejo integrado de plagas y jardinería.
          </p>
          <div className="cta-buttons">
            <Link to="/servicios" className="cta-button primary">
              Nuestros Servicios
            </Link>
            <a href="#contact-section" className="cta-button secondary">
              Contáctanos
            </a>
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

      <section id="contact-section" className="contact-section">
        <h2>Contáctanos</h2>
        <div className="contact-container">
          <form className="contact-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nombre completo"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Mensaje"
                className="form-input"
                rows="4"
                required
              ></textarea>
            </div>
            <button type="submit" className="cta-button primary">
              Enviar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
