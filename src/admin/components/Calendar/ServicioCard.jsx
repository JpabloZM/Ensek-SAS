import React, { useEffect, useState } from "react";
import { useAlertas } from "../../hooks/useAlertas";
import Swal from "sweetalert2";
import { userService } from "../../../client/services/userService";
import "./styles/services.css";
import "./styles/detalles.css";
import "./styles/card-reset.css"; // Importamos el archivo de reset para asegurar los estilos
import "./styles/sweetalert-override.css"; // Importamos estilos específicos para SweetAlert2
import "./styles/swal-dark-override.css"; // Importamos estilos específicos para SweetAlert2 en modo oscuro
import "./styles/swal-icon-spacing.css"; // Importamos estilos específicos para el espaciado de los iconos
import "./styles/swal-buttons.css"; // Importamos estilos específicos para los botones
import "./styles/assign-modal-buttons.css"; // Importamos estilos específicos para los botones del modal de asignación
import "./styles/modal-footer.css"; // Importamos estilos para que el footer tenga el mismo color del formulario
import "./styles/force-dark-modal.css"; // Este debe ser el último CSS importado para asegurar que tenga mayor prioridad

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
    // Verificar si estamos en modo oscuro
    const isDarkMode = document.body.classList.contains("dark-theme");

    mostrarAlerta({
      title: `Servicio de ${getTipoServicioEspanol(servicio.nombre)}`,
      showCloseButton: true,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#87c947",
      background: isDarkMode ? "#1a1c22" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      customClass: {
        popup: isDarkMode ? "swal-dark-theme" : "",
        title: isDarkMode ? "swal-dark-title" : "",
        htmlContainer: isDarkMode ? "swal-dark-content" : "",
        confirmButton: "swal-confirm-btn",
      },
      html: `
        <div class="detalles-content" style="background-color: ${
          isDarkMode ? "#2c2e35" : "#f8f9fa"
        }; color: ${isDarkMode ? "#fff" : "#333"}; padding: 1rem;">
          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.5rem; padding: 0.75rem 0.5rem; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
        isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-user" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Cliente
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${servicio.clientName}</div>
          </div>

          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
        isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-tools" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Servicio
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${getTipoServicioEspanol(
        servicio.nombre
      )}</div>
          </div>

          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
        isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-calendar-alt" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Fecha
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${formatearFecha(
        servicio.preferredDate,
        true
      )}</div>
          </div>

          ${
            servicio.clientPhone
              ? `
          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
                  isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-phone" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Teléfono
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${servicio.clientPhone}</div>
          </div>`
              : ""
          }

          ${
            servicio.clientEmail
              ? `
          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
                  isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-envelope" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Email
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${servicio.clientEmail}</div>
          </div>`
              : ""
          }

          ${
            servicio.address
              ? `
          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
                  isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-map-marker-alt" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Dirección
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${servicio.address}</div>
          </div>`
              : ""
          }

          ${
            servicio.descripcion
              ? `
          <div class="detalle-row" style="background-color: ${
            isDarkMode ? "#2c2e35" : "#fff"
          }; margin-bottom: 0.4rem; padding: 0.5rem 0; display: flex; align-items: start; line-height: 1.2; border-bottom: 1px solid ${
                  isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                };">
            <div class="detalle-label" style="color: #87c947; min-width: 100px; font-weight: 500; display: flex; align-items: center; padding-left: 0.5rem;">
              <i class="fas fa-info-circle" style="color: #87c947; margin-right: 0.5rem; margin-left: 0.25rem;"></i> Descripción
            </div>
            <div class="detalle-value" style="color: ${
              isDarkMode ? "#fff" : "#333"
            }; flex: 1; padding-left: 0.5rem;">${servicio.descripcion}</div>
          </div>`
              : ""
          }
        </div>
        <style>
          /* Sobrescribir estilos para asegurar colores correctos */
          .swal2-popup {
            padding: 1rem !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
          }
          
          .swal2-title {
            font-size: 1.1rem !important;
            padding: 0.5rem 0 !important;
            margin-bottom: 0.5rem !important;
            color: ${isDarkMode ? "#fff" : "#004122"} !important;
          }
          
          .swal2-html-container {
            margin: 0 !important;
            color: ${isDarkMode ? "#fff" : "#333"} !important;
          }
          
          /* Asegurar fondo oscuro en detalles */
          .detalles-content, 
          .detalle-row, 
          .detalle-row > * {
            background-color: ${isDarkMode ? "#2c2e35" : "#fff"} !important;
          }
          
          .detalle-label {
            color: #87c947 !important;
          }
          
          .detalle-value {
            color: ${isDarkMode ? "#fff" : "#333"} !important;
          }
          
          .swal2-actions {
            margin-top: 1rem !important;
          }
          
          .swal2-confirm {
            background-color: #87c947 !important;
            margin: 0 !important;
          }
          
          /* Estilos para el formulario */
          #asignarForm {
            margin-top: 1rem !important;
          }
          
          /* Estilos específicos para los botones en este modal */
          .swal-actions-container {
            margin-top: 1.5rem !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
            border-top: 1px solid ${
              isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
            } !important;
            padding-top: 1rem !important;
          }
          
          /* Estilos para botón confirmar específico de este modal */
          .custom-confirm-btn {
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
            font-weight: 500 !important;
          }
          
          /* Estilos para botón cancelar específico de este modal */
          .custom-cancel-btn {
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
            font-weight: 500 !important;
            border: 1px solid ${isDarkMode ? "#adb5bd" : "#6c757d"} !important;
            color: ${isDarkMode ? "#adb5bd" : "#6c757d"} !important;
          }
        </style>
      `,
      showCloseButton: true,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#87c947",
      background: isDarkMode ? "#1a1c22" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      customClass: {
        popup: `service-details-popup ${isDarkMode ? "swal-dark-theme" : ""}`,
        content: `service-details-content ${
          isDarkMode ? "swal-dark-content" : ""
        }`,
        htmlContainer: isDarkMode ? "swal-dark-content" : "",
      },
    });
  };

  const handleClick = () => {
    handleAsignar();
  };

  const handleAsignar = async () => {
    // Verificar si estamos en modo oscuro
    const isDarkMode = document.body.classList.contains("dark-theme");

    const { value: formValues } = await mostrarAlerta({
      title: "Asignar Servicio al Calendario",
      html: `
        <div class="detalles-servicio mb-2" style="background-color: ${
          isDarkMode ? "#2c2e35" : "#f8f9fa"
        }; color: ${
        isDarkMode ? "#fff" : "#333"
      }; border-radius: 4px; padding: 0.5rem;">
          <p class="mb-1"><strong style="color: ${
            isDarkMode ? "#87c947" : "#004122"
          };">Cliente:</strong> <span style="color: ${
        isDarkMode ? "#fff" : "#333"
      };">${servicio.clientName}</span></p>
          <p class="mb-1"><strong style="color: ${
            isDarkMode ? "#87c947" : "#004122"
          };">Dirección:</strong> <span style="color: ${
        isDarkMode ? "#fff" : "#333"
      };">${servicio.address}</span></p>
          <p class="mb-1"><strong style="color: ${
            isDarkMode ? "#87c947" : "#004122"
          };">Descripción:</strong> <span style="color: ${
        isDarkMode ? "#fff" : "#333"
      };">${servicio.descripcion}</span></p>
        </div>
        <form id="asignarForm" style="margin-top: 0.5rem;">
          <div class="mb-2">
            <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Técnico</label>
            <select id="tecnicoSelect" class="form-control" required style="background-color: ${
              isDarkMode ? "#2c2e35" : "#fff"
            }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
        isDarkMode ? "#444" : "#ced4da"
      }; padding: 0.4rem 0.75rem; font-size: 0.9rem;">
              <option value="">Seleccionar técnico...</option>
              ${technicians
                .map(
                  (technician) =>
                    `<option value="${
                      technician._id
                    }" style="background-color: ${
                      isDarkMode ? "#2c2e35" : "#fff"
                    }; color: ${isDarkMode ? "#fff" : "#333"};">${
                      technician.name
                    }</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Fecha</label>
            <input 
              type="date" 
              id="fecha" 
              class="form-control" 
              required 
              min="${new Date().toISOString().split("T")[0]}"
              value="${
                new Date(servicio.preferredDate).toISOString().split("T")[0]
              }"
              style="background-color: ${
                isDarkMode ? "#2c2e35" : "#fff"
              }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
        isDarkMode ? "#444" : "#ced4da"
      }; padding: 0.4rem 0.75rem; font-size: 0.9rem;"
            >
          </div>
          <div class="mb-2">
            <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Hora de inicio</label>
            <input 
              type="time" 
              id="horaInicio" 
              class="form-control" 
              required
              style="background-color: ${
                isDarkMode ? "#2c2e35" : "#fff"
              }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
        isDarkMode ? "#444" : "#ced4da"
      }; padding: 0.4rem 0.75rem; font-size: 0.9rem;"
            >
          </div>
          <div class="mb-2">
            <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Duración (minutos)</label>
            <input 
              type="number" 
              id="duracion" 
              class="form-control" 
              required 
              min="30" 
              step="15" 
              value="${servicio.duracion || 60}"
              style="background-color: ${
                isDarkMode ? "#2c2e35" : "#fff"
              }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
        isDarkMode ? "#444" : "#ced4da"
      }; padding: 0.4rem 0.75rem; font-size: 0.9rem;"
            >
          </div>
        </form>
        <style>
          .detalles-servicio p:last-child {
            margin-bottom: 0;
          }
          .swal2-popup {
            padding: 1rem;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
            color: ${isDarkMode ? "#fff" : "#333"} !important;
          }
          .swal2-title {
            font-size: 1.2rem !important;
            padding: 0.5rem 0 !important;
            color: ${isDarkMode ? "#fff" : "#004122"} !important;
          }
          .swal2-html-container {
            margin: 0.5rem 0 !important;
            color: ${isDarkMode ? "#fff" : "#333"} !important;
          }
          .swal2-actions {
            margin: 1rem 0 0 0 !important;
          }
          
          /* Asegurar que los select y sus opciones respeten el tema */
          .swal2-popup select,
          .swal2-popup .form-control {
            background-color: ${isDarkMode ? "#2c2e35" : "#fff"} !important;
            color: ${isDarkMode ? "#fff" : "#333"} !important;
            border-color: ${isDarkMode ? "#444" : "#ced4da"} !important;
          }
          
          .swal2-popup select option {
            background-color: ${isDarkMode ? "#2c2e35" : "#fff"} !important;
            color: ${isDarkMode ? "#fff" : "#333"} !important;
          }
        </style>
      `,
      background: isDarkMode ? "#1a1c22" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      customClass: {
        popup: isDarkMode ? "swal-dark-theme" : "",
        title: isDarkMode ? "swal-dark-title" : "",
        htmlContainer: isDarkMode ? "swal-dark-content" : "",
        confirmButton: "swal-confirm-btn custom-confirm-btn",
        cancelButton: "swal-cancel-btn custom-cancel-btn",
        actions: "swal-actions-container",
      },
      showCancelButton: true,
      confirmButtonText: "Asignar",
      confirmButtonColor: "#87c947",
      cancelButtonText: "Cancelar",
      cancelButtonColor: isDarkMode ? "transparent" : "#6c757d",
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

  // Determinar si estamos en modo oscuro
  const isDarkMode = document.body.classList.contains("dark-theme");

  return (
    <div
      className="servicio-card"
      onClick={handleClick}
      style={{
        backgroundColor: isDarkMode ? "#2c2e35" : "#ffffff",
        borderColor: "#c5f198",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        transform: "none",
      }}
    >
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
            className="eliminar-servicio"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar();
            }}
            title="Eliminar servicio"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicioCard;
