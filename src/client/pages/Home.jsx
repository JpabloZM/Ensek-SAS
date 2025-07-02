import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import "./Home.css";

// Componente Toast para mostrar mensajes de éxito o error
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // El toast desaparecerá después de 5 segundos

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
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
    setToast(null);

    // Configuración de EmailJS
    // Necesitas registrarte en https://www.emailjs.com/ y obtener tus propias credenciales
    const serviceId = "service_ejs722a"; // Reemplazar con tu Service ID de EmailJS
    const templateId = "template_74h91fj"; // Reemplazar con tu Template ID de EmailJS
    const publicKey = "Uy_VV-Z0EYjmgtge1"; // Reemplazar con tu Public Key de EmailJS

    // Envío del correo usando EmailJS
    emailjs
      .sendForm(serviceId, templateId, formRef.current, publicKey)
      .then((result) => {
        console.log("Email sent successfully:", result.text);
        setToast({
          message:
            "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
          type: "success",
        });
        // Limpiar el formulario
        setFormState({
          name: "",
          email: "",
          message: "",
        });
        // Resetear el formulario para asegurar que se limpie completamente
        formRef.current.reset();
      })
      .catch((error) => {
        console.error("Email sending failed:", error.text);
        setToast({
          message:
            "Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.",
          type: "error",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Cerrar el toast
  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className="home">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      <div className="hero-section">
        {/* Add particle container */}
        <div className="particles-background">
          {[...Array(50)].map((_, index) => (
            <div key={index} className="particle" />
          ))}
        </div>

        <div className="hero-content">
          <h1>Bienvenido a ENSEK</h1>
          <p>Saneamineto ambiental</p>
          <div className="cta-buttons">
            <Link to="/welcome/servicios" className="cta-button primary">
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

      <section className="partners-section">
        <h2>Nuestros Aliados</h2>
        <div className="partners-container">
          <div className="partner-logo">
            <img
              src="https://placehold.co/200x100/004122/FFFFFF/png?text=EcoSolutions"
              alt="EcoSolutions"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://placehold.co/200x100/006837/FFFFFF/png?text=GreenTech"
              alt="GreenTech"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://placehold.co/200x100/009245/FFFFFF/png?text=BioPlanet"
              alt="BioPlanet"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://placehold.co/200x100/66b417/FFFFFF/png?text=AguaPura"
              alt="AguaPura"
            />
          </div>
          <div className="partner-logo">
            <img
              src="https://placehold.co/200x100/87c947/FFFFFF/png?text=EcoVida"
              alt="EcoVida"
            />
          </div>
        </div>
      </section>

      <section id="contact-section" className="contact-section">
        <h2>Contáctanos</h2>
        <div className="contact-container">
          <form
            className="contact-form"
            ref={formRef}
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                className="form-input"
                value={formState.name}
                onChange={handleInputChange}
                autoComplete="off"
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
                autoComplete="off"
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
        </div>
      </section>
    </div>
  );
};

export default Home;
