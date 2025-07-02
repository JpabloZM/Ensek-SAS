import React, { useEffect, useState } from "react";
import { useAlertas } from "../../hooks/useAlertas";
import Swal from "sweetalert2";
import { userService } from "../../../client/services/userService";
import "./styles/services.css";
import "./styles/detalles.css";

const { getTechnicians: fetchTechnicians } = userService;

// Mapeo de nombres de servicios a español
const serviciosEnEspanol = {
  aire_acondicionado: "Aire Acondicionado",
  electrico: "Servicio Eléctrico",
  plomeria: "Plomería",
  electrodomesticos: "Electrodomésticos",
  calefaccion: "Calefacción",
  mantenimiento: "Mantenimiento General",
  instalacion: "Instalación",
  reparacion: "Reparación",
  "pest-control": "Control de Plagas",
  // Agregar más mapeos según sea necesario
};

const ServicioCard = ({ servicio, onEliminar, onAsignarServicio }) => {
  const { mostrarAlerta } = useAlertas();
  const [technicians, setTechnicians] = useState([]);

  // Validar y preparar el servicio cuando se recibe
  useEffect(() => {
    console.log("Servicio en ServicioCard:", servicio);
  }, [servicio]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const response = await fetchTechnicians();
        setTechnicians(response);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      }
    };

    loadTechnicians();
  }, []);

  const getTipoServicioEspanol = (tipo) => {
    if (!tipo) return "No especificado";
    return serviciosEnEspanol[tipo] || tipo;
  };

  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return "No especificado";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const formatearFecha = (fecha, incluirAno = false) => {
    if (!fecha) return "No especificada";
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return "No especificada";

      const opciones = {
        weekday: "long",
        month: "long",
        day: "numeric",
        ...(incluirAno && { year: "numeric" }),
      };
      const fechaFormateada = date.toLocaleDateString("es-CO", opciones);
      return capitalizarPrimeraLetra(fechaFormateada);
    } catch (error) {
      console.error("Error al formatear fecha:", error, fecha);
      return "No especificada";
    }
  };

  const mostrarDetallesServicio = () => {
    mostrarAlerta({
      title: `Servicio de ${getTipoServicioEspanol(servicio.nombre)}`,
      html: `
        <div class="detalles-content">
          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-user"></i> Cliente
            </div>
            <div class="detalle-value">${servicio.clientName}</div>
          </div>

          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-tools"></i> Servicio
            </div>
            <div class="detalle-value">${getTipoServicioEspanol(
              servicio.nombre
            )}</div>
          </div>

          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-calendar-alt"></i> Fecha
            </div>
            <div class="detalle-value">${formatearFecha(
              servicio.preferredDate,
              true
            )}</div>
          </div>

          ${
            servicio.clientPhone
              ? `
          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-phone"></i> Teléfono
            </div>
            <div class="detalle-value">${servicio.clientPhone}</div>
          </div>`
              : ""
          }

          ${
            servicio.clientEmail
              ? `
          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-envelope"></i> Email
            </div>
            <div class="detalle-value">${servicio.clientEmail}</div>
          </div>`
              : ""
          }

          ${
            servicio.address
              ? `
          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-map-marker-alt"></i> Dirección
            </div>
            <div class="detalle-value">${servicio.address}</div>
          </div>`
              : ""
          }

          ${
            servicio.descripcion
              ? `
          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-info-circle"></i> Descripción
            </div>
            <div class="detalle-value">${servicio.descripcion}</div>
          </div>`
              : ""
          }
        </div>
        <style>
          .detalles-content {
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 0.9rem;
          }
          .detalle-row {
            display: flex;
            align-items: start;
            margin-bottom: 0.4rem;
            line-height: 1.2;
          }
          .detalle-row:last-child {
            margin-bottom: 0;
          }
          .detalle-label {
            min-width: 90px;
            color: #87c947;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.3rem;
          }
          .detalle-value {
            flex: 1;
            padding-left: 0.5rem;
          }
          .swal2-popup {
            padding: 1rem !important;
          }
          .swal2-title {
            font-size: 1.1rem !important;
            padding: 0.5rem 0 !important;
            margin-bottom: 0.5rem !important;
          }
          .swal2-html-container {
            margin: 0 !important;
          }
          .swal2-actions {
            margin-top: 1rem !important;
          }
          .swal2-confirm {
            margin: 0 !important;
          }
        </style>
      `,
      showCloseButton: true,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#87c947",
      background: "#ffffff",
      customClass: {
        popup: "service-details-popup",
        content: "service-details-content",
      },
    });
  };

  const handleClick = () => {
    handleAsignar();
  };

  const handleAsignar = async () => {
    const { value: formValues } = await mostrarAlerta({
      title: "Asignar Servicio al Calendario",
      html: `
        <div class="detalles-servicio mb-2">
          <p class="mb-1"><strong>Cliente:</strong> ${servicio.clientName}</p>
          <p class="mb-1"><strong>Dirección:</strong> ${servicio.address}</p>
          <p class="mb-1"><strong>Descripción:</strong> ${
            servicio.descripcion
          }</p>
        </div>
        <form id="asignarForm" style="margin-top: 0.5rem;">
          <div class="mb-2">
            <label class="form-label mb-1">Técnico</label>
            <select id="tecnicoSelect" class="form-control" required>
              <option value="">Seleccionar técnico...</option>
              ${technicians
                .map(
                  (technician) =>
                    `<option value="${technician._id}">${technician.name}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label mb-1">Fecha</label>
            <input 
              type="date" 
              id="fecha" 
              class="form-control" 
              required 
              min="${new Date().toISOString().split("T")[0]}"
              value="${
                new Date(servicio.preferredDate).toISOString().split("T")[0]
              }"
            >
          </div>
          <div class="mb-2">
            <label class="form-label mb-1">Hora de inicio</label>
            <input type="time" id="horaInicio" class="form-control" required>
          </div>
          <div class="mb-2">
            <label class="form-label mb-1">Duración (minutos)</label>
            <input 
              type="number" 
              id="duracion" 
              class="form-control" 
              required 
              min="30" 
              step="15" 
              value="${servicio.duracion || 60}"
            >
          </div>
        </form>
        <style>
          .detalles-servicio {
            font-size: 0.9rem;
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .detalles-servicio p:last-child {
            margin-bottom: 0;
          }
          .form-label {
            color: #87c947;
            font-weight: 500;
            font-size: 0.9rem;
          }
          .form-control {
            padding: 0.4rem 0.75rem;
            font-size: 0.9rem;
          }
          .swal2-popup {
            padding: 1rem;
          }
          .swal2-title {
            font-size: 1.2rem !important;
            padding: 0.5rem 0 !important;
          }
          .swal2-html-container {
            margin: 0.5rem 0 !important;
          }
          .swal2-actions {
            margin: 1rem 0 0 0 !important;
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      confirmButtonColor: "#87c947",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#e74c3c",
      preConfirm: () => {
        const tecnicoId = document.getElementById("tecnicoSelect").value;
        const fecha = document.getElementById("fecha").value;
        const horaInicio = document.getElementById("horaInicio").value;
        const duracion = document.getElementById("duracion").value;

        if (!tecnicoId || !fecha || !horaInicio || !duracion) {
          Swal.showValidationMessage("Por favor complete todos los campos");
          return false;
        }

        return { tecnicoId, fecha, horaInicio, duracion };
      },
    });

    if (formValues) {
      const { tecnicoId, fecha, horaInicio, duracion } = formValues;

      // Create calendar event
      const fechaInicio = new Date(`${fecha}T${horaInicio}`);
      const fechaFin = new Date(
        fechaInicio.getTime() + parseInt(duracion) * 60000
      );

      const eventoCalendario = {
        id: `evento-${servicio.id}`,
        title: `${servicio.nombre} - ${servicio.clientName}`,
        start: fechaInicio.toISOString(),
        end: fechaFin.toISOString(),
        resourceId: tecnicoId,
        backgroundColor: "#87c947",
        borderColor: "#87c947",
        extendedProps: {
          estado: "confirmado",
          descripcion: servicio.descripcion,
          cliente: servicio.clientName,
          telefono: servicio.clientPhone,
          email: servicio.clientEmail,
          direccion: servicio.address,
        },
      };

      // Asegurarnos de usar el ID correcto del servicio
      const serviceId = servicio._id || servicio.id;

      onAsignarServicio(eventoCalendario, serviceId);

      mostrarAlerta({
        icon: "success",
        title: "Servicio Asignado",
        text: "El servicio ha sido asignado al calendario",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="servicio-card" onClick={handleClick}>
      <div className="d-flex justify-content-between align-items-start">
        <div className="contenido-servicio">
          <h5>
            <i className="fas fa-tag icon-primary"></i>{" "}
            {getTipoServicioEspanol(servicio.nombre)}
          </h5>
          <p className="mb-1">
            <i className="fas fa-user icon-primary"></i> {servicio.clientName}
          </p>
          <p className="mb-1">
            {" "}
            <i className="fas fa-calendar-alt icon-primary"></i>{" "}
            {formatearFecha(servicio.preferredDate, false)}
          </p>
          <p className="mb-0 descripcion-truncada">
            <i className="fas fa-info-circle icon-primary"></i>{" "}
            {servicio.descripcion}
          </p>
        </div>
        <div className="botones-container">
          <button
            className="btn btn-link text-primary p-0 ver-detalles"
            onClick={(e) => {
              e.stopPropagation();
              mostrarDetallesServicio();
            }}
            title="Ver detalles"
          >
            <i className="fas fa-info-circle"></i>
          </button>
          <button
            className="btn btn-link text-danger p-0 eliminar-servicio"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar();
            }}
            title="Eliminar servicio"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicioCard;
