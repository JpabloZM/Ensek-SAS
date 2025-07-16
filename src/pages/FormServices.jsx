import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiService } from "../../utils/apiService";
import "./FormServices.css";

const FormServices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDate: "",
    serviceType: "",
    description: "",
    municipality: "",
    neighborhood: "",
    streetAddress: "",
    addressDetails: "",
    address: "", // Este campo se construirá a partir de los campos anteriores
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Construir dirección completa a partir de los campos individuales
      const fullAddress = `${formData.municipality}, ${
        formData.neighborhood
      }, ${formData.streetAddress}${
        formData.addressDetails ? ", " + formData.addressDetails : ""
      }`;

      // Send form data to the API
      await apiService.services.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        municipality: formData.municipality,
        neighborhood: formData.neighborhood,
        streetAddress: formData.streetAddress,
        addressDetails: formData.addressDetails || "",
        serviceType: formData.serviceType,
        description: formData.description || "Sin descripción",
        preferredDate: formData.preferredDate,
      });

      // Mostrar alerta de éxito
      await Swal.fire({
        title: "¡Cita Agendada!",
        text: "Tu solicitud ha sido enviada exitosamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#00a884",
        background: "#1a1a1a",
        color: "#ffffff",
        timer: 1500, // Cerrar automáticamente después de 1.5 segundos
        timerProgressBar: true, // Mostrar una barra de progreso
        showClass: {
          popup: "animate__animated animate__fadeIn animate__faster", // Más rápido
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut animate__faster", // Más rápido
        },
        customClass: {
          confirmButton: "swal-button",
        },
      });

      // Redireccionar a la página de servicios
      navigate("/servicios");
    } catch (error) {
      // Mostrar alerta de error
      Swal.fire({
        title: "¡Ups!",
        text: "Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#00a884",
        background: "#1a1a1a",
        color: "#ffffff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Partículas flotantes */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>

      {/* Puntos decorativos */}
      <div className="decoration-dots left"></div>
      <div className="decoration-dots right"></div>

      <div className="form-services">
        {/* Efecto de círculo con estela */}
        <div className="circle-trail left"></div>
        <div className="circle-trail right"></div>

        <h2>Agendar una Cita</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="Tu correo"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                placeholder="Tu teléfono"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="serviceType">Tipo de Servicio</label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="pest-control">Control de Plagas</option>
                <option value="gardening">Jardinería</option>
                <option value="fumigation">Fumigación</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredDate">Fecha Preferida</label>
              <input
                type="date"
                id="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="municipality">Municipio</label>
              <input
                type="text"
                id="municipality"
                placeholder="Ej: Medellín, Bello, Envigado..."
                value={formData.municipality}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="neighborhood">Barrio o Sector</label>
              <input
                type="text"
                id="neighborhood"
                placeholder="Nombre del barrio o sector"
                value={formData.neighborhood}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="streetAddress">Dirección Específica</label>
              <input
                type="text"
                id="streetAddress"
                placeholder="Calle/Carrera, número"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="addressDetails">Detalles Adicionales</label>
              <input
                type="text"
                id="addressDetails"
                placeholder="Apto/Casa/Empresa/Referencias"
                value={formData.addressDetails}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                rows="3"
                placeholder="Describe el servicio que necesitas"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className={`cta-button primary ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              <span className="button-content">
                {isLoading ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Agendar Cita"
                )}
              </span>
            </button>
            <Link to="/servicios" className="back-link">
              Volver a Servicios
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormServices;
