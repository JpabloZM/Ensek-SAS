import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useAuth } from "../../hooks/useAuth";
import "./FormServices.css";

const FormServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get service type from state or URL search params
  const searchParams = new URLSearchParams(location.search);
  const serviceTypeFromURL = searchParams.get("serviceType");
  const initialServiceType =
    location.state?.serviceType || serviceTypeFromURL || "";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    preferredDate: "",
    serviceType: initialServiceType,
    description: "",
    municipality: "",
    neighborhood: "",
    address: "",
    addressDetails: "",
  });

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
      }));
    }
  }, [user]);

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

    console.log("=== INICIO CREACIÓN DE SERVICIO ===");
    console.log("Datos del formulario:", formData);
    console.log("Usuario actual:", user);

    try {
      // Verificar autenticación
      const userString = localStorage.getItem("user");
      console.log("Datos de usuario en localStorage:", userString);

      // Guardar el servicio usando localStorage
      // Construimos una dirección completa con todos los campos
      const fullAddress =
        `${formData.municipality}, ${formData.neighborhood}, ${formData.address}, ${formData.addressDetails}`.trim();

      const serviceData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        // Guardamos tanto la dirección completa como los campos individuales
        address: fullAddress || "No especificada",
        municipality: formData.municipality || "",
        neighborhood: formData.neighborhood || "",
        streetAddress: formData.address || "",
        addressDetails: formData.addressDetails || "",
        serviceType: formData.serviceType,
        description: formData.description || "Sin descripción",
        preferredDate: formData.preferredDate,
        technician: null, // Ensure technician is set to null on creation
      };

      console.log("Datos a enviar al servidor:", serviceData);

      const result = await serviceService.saveService(serviceData);
      console.log("Resultado de la creación:", result);

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

      // Redireccionar a la página de servicios del cliente
      navigate("/app/servicios");
    } catch (error) {
      console.error("Error completo:", error);

      // Mostrar alerta de error más detallada
      Swal.fire({
        title: "¡Ups!",
        text:
          error.message ||
          "Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.",
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
        <form onSubmit={handleSubmit} autoComplete="off">
          {" "}
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
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
              autoComplete="email"
            />
          </div>{" "}
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              placeholder="Tu teléfono"
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>
          <div className="form-group">
            <label htmlFor="document">Documento de Identidad</label>
            <input
              type="text"
              id="document"
              placeholder="Tu documento de identidad"
              value={formData.document}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="municipality">Municipio</label>
            <input
              type="text"
              id="municipality"
              placeholder="Municipio"
              value={formData.municipality}
              onChange={handleChange}
              required
              autoComplete="address-level2"
            />
          </div>
          <div className="form-group">
            <label htmlFor="neighborhood">Barrio</label>
            <input
              type="text"
              id="neighborhood"
              placeholder="Barrio o sector"
              value={formData.neighborhood}
              onChange={handleChange}
              required
              autoComplete="address-level3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              placeholder="Calle/Carrera, número"
              value={formData.address}
              onChange={handleChange}
              required
              autoComplete="street-address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="addressDetails">Especificaciones del lugar</label>
            <textarea
              id="addressDetails"
              placeholder="Detalles adicionales del lugar (casa, apartamento, empresa, punto de referencia...)"
              value={formData.addressDetails}
              onChange={handleChange}
              autoComplete="off"
              rows="2"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="preferredDate">Fecha Preferida</label>
            <input
              type="date"
              id="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="serviceType">Tipo de Servicio</label>
            <select
              id="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              autoComplete="off"
              className="service-type-select"
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              <option value="pest-control">Control de Plagas</option>
              <option value="gardening">Jardinería</option>
              <option value="residential-fumigation">
                Fumigación Residencial
              </option>
              <option value="commercial-fumigation">
                Fumigación Comercial
              </option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              rows="4"
              placeholder="Describe el servicio que necesitas"
              value={formData.description}
              onChange={handleChange}
              autoComplete="off"
            ></textarea>
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
            </button>{" "}
            <Link to="/app/servicios" className="back-link">
              Volver a Servicios
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormServices;
