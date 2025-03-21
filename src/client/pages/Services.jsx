import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      title: "Mantenimiento Preventivo",
      description:
        "Servicio regular para prevenir fallos y mantener el rendimiento óptimo.",
      icon: "fas fa-tools",
      price: "Desde $50.000",
    },
    {
      id: 2,
      title: "Reparación de Emergencia",
      description: "Servicio rápido para solucionar problemas urgentes.",
      icon: "fas fa-bolt",
      price: "Desde $80.000",
    },
    {
      id: 3,
      title: "Instalación de Equipos",
      description: "Instalación profesional de nuevos equipos y sistemas.",
      icon: "fas fa-plug",
      price: "Desde $100.000",
    },
  ]);

  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>Nuestros Servicios</h1>
        <p>Soluciones técnicas profesionales para todas tus necesidades</p>
      </section>

      <section className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon">
              <i className={service.icon}></i>
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <div className="service-price">{service.price}</div>
            <Link to={`/solicitar/${service.id}`} className="request-button">
              Solicitar Servicio
            </Link>
          </div>
        ))}
      </section>

      <section className="why-choose-us">
        <h2>¿Por qué elegirnos?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <i className="fas fa-clock"></i>
            <h4>Servicio Rápido</h4>
            <p>Respuesta inmediata a tus necesidades</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-certificate"></i>
            <h4>Técnicos Certificados</h4>
            <p>Personal altamente calificado</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-shield-alt"></i>
            <h4>Garantía de Servicio</h4>
            <p>Satisfacción garantizada</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
