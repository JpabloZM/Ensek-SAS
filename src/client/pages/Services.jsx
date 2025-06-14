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
      link: "pest-control",
      icon: "fas fa-bug",
    },
    {
      title: "Fumigación Residencial",
      description: "Protege tu hogar con nuestros servicios de fumigación.",
      link: "residential-fumigation",
      icon: "fas fa-home",
    },
    {
      title: "Fumigación Comercial",
      description: "Soluciones para mantener tu negocio libre de plagas.",
      link: "commercial-fumigation",
      icon: "fas fa-building",
    },
    {
      title: "Jardinería",
      description: "Diseño y mantenimiento de jardines personalizados.",
      link: "gardening",
      icon: "fas fa-leaf",
    },
  ];
  const handleCardClick = (serviceType) => {
    // Pass the service type both in state and URL parameter for better compatibility
    navigate(`/app/servicios/formulario?serviceType=${serviceType}`, { state: { serviceType } });
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
            onClick={() => handleCardClick(service.link)} // Pasa el título como tipo de servicio
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