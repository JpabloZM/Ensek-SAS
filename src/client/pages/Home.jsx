import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import "./Home.css";

const Home = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const formRef = useRef();

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Configuración de EmailJS
    // Necesitas registrarte en https://www.emailjs.com/ y obtener tus propias credenciales
    const serviceId = "service_ensek"; // Reemplazar con tu Service ID de EmailJS
    const templateId = "template_ensek"; // Reemplazar con tu Template ID de EmailJS
    const publicKey = "YOUR_PUBLIC_KEY"; // Reemplazar con tu Public Key de EmailJS

    // Envío del correo usando EmailJS
    emailjs
      .sendForm(serviceId, templateId, formRef.current, publicKey)
      .then((result) => {
        console.log("Email sent successfully:", result.text);
        setSubmitStatus({
          success: true,
          message:
            "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
        });
        // Limpiar el formulario
        setFormState({
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((error) => {
        console.error("Email sending failed:", error.text);
        setSubmitStatus({
          success: false,
          message:
            "Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

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
          <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                className="form-input"
                value={formState.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="form-input"
                value={formState.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Mensaje"
                className="form-input"
                rows="4"
                value={formState.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="cta-button primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {submitStatus && (
            <div
              className={`submit-status ${
                submitStatus.success ? "success" : "error"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
