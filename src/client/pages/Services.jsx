import React from "react";
import { useNavigate } from "react-router-dom";
import "./Service.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Control de Plagas",
      description: "Eliminamos cucarachas, hormigas, roedores y más.",
      icon: "fas fa-bug",
    },
    {
      title: "Fumigación Residencial",
      description: "Protege tu hogar con nuestros servicios de fumigación.",
      icon: "fas fa-home",
    },
    {
      title: "Fumigación Comercial",
      description: "Soluciones para mantener tu negocio libre de plagas.",
      icon: "fas fa-building",
    },
    {
      title: "Jardinería",
      description: "Diseño y mantenimiento de jardines personalizados.",
      icon: "fas fa-leaf",
    },
  ];

  const handleCardClick = () => {
    navigate("/servicios/formulario"); // Navega a la página FormServices
  };

  return (
    <div className="services-page">
      <header className="services-header">
        <h1>Nuestros Servicios</h1>
        <p>Descubre cómo podemos ayudarte a mantener tu hogar o negocio en perfectas condiciones.</p>
      </header>
      <section className="services-grid">
        {services.map((service, index) => (
          <div
            className="service-card"
            key={index}
            onClick={handleCardClick} // Maneja el clic en la tarjeta
          >
            <i className={service.icon}></i>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Services;