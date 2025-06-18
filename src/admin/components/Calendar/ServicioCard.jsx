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
    return serviciosEnEspanol[tipo] || tipo;
  };

  const capitalizarPrimeraLetra = (texto) => {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const formatearFecha = (fecha, incluirAno = false) => {
    if (!fecha) return "No especificada";
    const date = new Date(fecha);
    const opciones = {
      weekday: "long",
      month: "long",
      day: "numeric",
      ...(incluirAno && { year: "numeric" }),
    };
    const fechaFormateada = date.toLocaleDateString("es-CO", opciones);
    return capitalizarPrimeraLetra(fechaFormateada);
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
              <i class="fas fa-tools"></i> Tipo de Servicio
            </div>
            <div class="detalle-value">${getTipoServicioEspanol(
              servicio.nombre
            )}</div>
          </div>

          <div class="detalle-row">
            <div class="detalle-label">
              <i class="fas fa-calendar-alt"></i> Fecha preferida
            </div>
            <div class="detalle-value">
              ${formatearFecha(servicio.preferredDate, true)}
            </div>
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
        <div class="detalles-servicio mb-4">
          <p><strong>Cliente:</strong> ${servicio.clientName}</p>
          <p><strong>Contacto:</strong> ${servicio.clientEmail} | ${
        servicio.clientPhone
      }</p>
          <p><strong>Dirección:</strong> ${servicio.address}</p>
          <p><strong>Descripción:</strong> ${servicio.descripcion}</p>
        </div>
        <form id="asignarForm">
          <div class="mb-3">
            <label class="form-label">Técnico</label>
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
          <div class="mb-3">
            <label class="form-label">Fecha</label>
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
          <div class="mb-3">
            <label class="form-label">Hora de inicio</label>
            <input type="time" id="horaInicio" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Duración (minutos)</label>
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

      onAsignarServicio(eventoCalendario, servicio.id);

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
