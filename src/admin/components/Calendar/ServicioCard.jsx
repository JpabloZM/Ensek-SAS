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
import "./styles/card-buttons.css"; // Importamos estilos específicos para los botones de la tarjeta
import "./styles/add-technician-button.css"; // Importamos estilos específicos para el botón de agregar técnico
import "./styles/export-button.css"; // Importamos estilos específicos para el botón de exportar
import "./styles/servicio-info-modal.css"; // Estilos específicos para el modal de información de servicio
import "./styles/modal-animations.css"; // Animaciones para modales
import "./styles/clean-modal-buttons.css"; // Elimina el fondo gris de los botones
import "./styles/equal-button-width.css"; // Asegura que los botones tengan el mismo ancho
import "./styles/force-dark-modal.css"; // Este debe ser el último CSS importado para asegurar que tenga mayor prioridad

const { getTechnicians: fetchTechnicians } = userService;

// Mapeo de nombres de servicios a español
const serviciosEnEspanol = {
  aire_acondicionado: "Aire Acondicionado",
  pest_control: "Control de Plagas",
  gardening: "Jardinería",
  residential_fumigation: "Fumigación Residencial",
  commercial_fumigation: "Fumigación Comercial",
  "pest-control": "Control de Plagas",
  "residential-fumigation": "Fumigación Residencial",
  "commercial-fumigation": "Fumigación Comercial",
};

const ServicioCard = ({
  servicio,
  onEliminar,
  onAsignarServicio,
  onEditar,
}) => {
  const { mostrarAlerta } = useAlertas();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);

  // Función para cargar técnicos
  const fetchAvailableTechnicians = async () => {
    try {
      setLoading(true);
      const data = await fetchTechnicians();
      if (Array.isArray(data)) {
        const activeTechnicians = data.filter(
          (tech) => tech.active !== false && tech.role === "technician"
        );
        setTechnicians(activeTechnicians);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTechnicians();
  }, []);

  // Formatear el nombre del servicio
  const formatServiceName = (serviceType) => {
    if (!serviceType) return "Servicio";
    // Usar el mapeo si existe
    return (
      serviciosEnEspanol[serviceType.toLowerCase()] ||
      serviceType
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const handleEditar = async () => {
    // Mostrar modal de edición
    const { value: formValues } = await mostrarAlerta({
      title: "Editar Servicio",
      html: `
        <form id="editarServicioForm">
          <div class="input-group">
            <label>Tipo de servicio</label>
            <select id="nombre" class="form-field" required>
              <option value="">Seleccionar tipo de servicio...</option>
              <option value="Control de Plagas" ${
                servicio.serviceType === "Control de Plagas" ? "selected" : ""
              }>Control de Plagas</option>
              <option value="Fumigación" ${
                servicio.serviceType === "Fumigación" ? "selected" : ""
              }>Fumigación</option>
              <option value="Desinfección" ${
                servicio.serviceType === "Desinfección" ? "selected" : ""
              }>Desinfección</option>
              <option value="Otro" ${
                servicio.serviceType === "Otro" ? "selected" : ""
              }>Otro</option>
            </select>
          </div>
          <div class="input-group">
            <label>Cliente</label>
            <input type="text" id="clientName" class="form-field" placeholder="Nombre del cliente" value="${
              servicio.clientName || ""
            }" required>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="clientEmail" class="form-field" placeholder="correo@ejemplo.com" value="${
              servicio.clientEmail || ""
            }" required>
          </div>
          <div class="input-group">
            <label>Teléfono</label>
            <input type="tel" id="clientPhone" class="form-field" placeholder="Teléfono de contacto" value="${
              servicio.clientPhone || ""
            }" required>
          </div>
          <div class="input-group">
            <label>Dirección</label>
            <input type="text" id="address" class="form-field" placeholder="Dirección del servicio" value="${
              servicio.address || ""
            }" required>
          </div>
          <div class="input-group">
            <label>Descripción</label>
            <textarea id="descripcion" class="form-field" placeholder="Descripción detallada del servicio" rows="2" required>${
              servicio.descripcion || servicio.description || ""
            }</textarea>
          </div>
        </form>
        <style>
          #editarServicioForm {
            display: grid;
            gap: 10px;
            padding: 15px;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .input-group label {
            color: #87c947;
            font-weight: 500;
          }
          .form-field {
            padding: 8px;
            border: 1px solid #87c947;
            border-radius: 4px;
            background: white;
            width: 100%;
            box-sizing: border-box;            
            min-width: 370px;
            max-width: 370px;
          }
          .swal2-popup {
            width: 500px !important;
          }
          .swal2-title {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      background: "#ffffff",
      color: "#004122",
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value;
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const address = document.getElementById("address").value;
        const descripcion = document.getElementById("descripcion").value;

        if (
          !nombre ||
          !clientName ||
          !clientEmail ||
          !clientPhone ||
          !address ||
          !descripcion
        ) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor complete todos los campos",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        // Preparar datos del formulario
        return {
          nombre: nombre,
          serviceType: nombre,
          clientName,
          clientEmail,
          clientPhone,
          address,
          descripcion,
          document: servicio.document || "1234567890",
        };
      },
    });

    if (formValues) {
      try {
        // Llamar a la función de editar pasada como prop
        if (onEditar) {
          await onEditar(servicio.id || servicio._id, formValues);
          mostrarAlerta({
            icon: "success",
            title: "Servicio Actualizado",
            text: "El servicio ha sido actualizado correctamente",
            timer: 1500,
            showConfirmButton: false,
            background: "#f8ffec",
            color: "#004122",
          });
        }
      } catch (error) {
        console.error("Error al editar servicio:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el servicio. Por favor, intente nuevamente.",
          confirmButtonColor: "#87c947",
          background: "#f8ffec",
          color: "#004122",
        });
      }
    }
  };

  const handleClick = () => {
    // Mostrar detalles completos del servicio
    mostrarAlerta({
      title: `${formatServiceName(servicio.serviceType)}`,
      html: `
        <div class="detalles-servicio">
          <div class="detalles-row">
            <div class="detalles-label">Cliente</div>
            <div class="detalles-value">${servicio.clientName}</div>
          </div>
          <div class="detalles-row">
            <div class="detalles-label">Email</div>
            <div class="detalles-value">${
              servicio.clientEmail || "No disponible"
            }</div>
          </div>
          <div class="detalles-row">
            <div class="detalles-label">Teléfono</div>
            <div class="detalles-value">${
              servicio.clientPhone || "No disponible"
            }</div>
          </div>
          <div class="detalles-row">
            <div class="detalles-label">Dirección</div>
            <div class="detalles-value">${
              servicio.address || "No disponible"
            }</div>
          </div>
          <div class="detalles-row">
            <div class="detalles-label">Descripción</div>
            <div class="detalles-value">${
              servicio.descripcion || servicio.description || "Sin descripción"
            }</div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      confirmButtonText: '<i class="fas fa-calendar-plus"></i> Asignar',
      cancelButtonText: '<i class="fas fa-trash"></i> Eliminar',
      customClass: {
        popup: "servicio-info-modal",
        title: "servicio-info-title",
        htmlContainer: "servicio-info-container",
        actions: "servicio-info-actions",
        footer: "servicio-info-footer",
        confirmButton: "btn-confirm-servicio",
        cancelButton: "btn-cancel-servicio",
      },
      backdrop: `
        rgba(0,0,0,0.4)
      `,
      showClass: {
        popup: "animate__animated animate__fadeIn",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOut",
      },
      didOpen: () => {
        // Reubicar el botón Editar junto a los botones principales
        const swalActions = document.querySelector(".swal2-actions");
        if (swalActions) {
          const btnEditar = document.createElement("button");
          btnEditar.id = "btn-editar-servicio";
          btnEditar.className = "swal2-styled swal2-edit-btn";
          btnEditar.style.background = "#6c757d";
          btnEditar.style.color = "#fff";
          btnEditar.style.fontWeight = "bold";
          btnEditar.style.order = "0";
          btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
          btnEditar.onclick = (e) => {
            e.stopPropagation();
            Swal.close();
            handleEditar();
          };
          // Insertar como primer botón
          swalActions.insertBefore(btnEditar, swalActions.firstChild);
        }
      },
      showDenyButton: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Asignar servicio
        handleAsignar();
      } else if (result.isDismissed && result.dismiss === "cancel") {
        // Eliminar servicio
        onEliminar();
      }
    });
  };

  const renderTechniciansList = () => {
    return (
      <div id="tecnicos-seleccionados" className="tecnicos-container">
        <div className="tecnicos-header">
          <span>Técnicos Seleccionados</span>
        </div>
        <div className="tecnicos-list">
          {selectedTechnicians.length > 0 ? (
            selectedTechnicians.map((tech) => (
              <div key={tech._id} className="tecnico-item">
                <span className="tecnico-name">{tech.name}</span>
                <button
                  className="remove-tecnico"
                  onClick={() =>
                    setSelectedTechnicians(
                      selectedTechnicians.filter((t) => t._id !== tech._id)
                    )
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="no-tecnicos">No hay técnicos seleccionados</div>
          )}
        </div>
      </div>
    );
  };

  // HTML para el modal de asignación
  const getModalHtml = () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinutes = now.getMinutes().toString().padStart(2, "0");

    // La función exportCalendarData se ha movido al evento didOpen del modal
    // para tener mejor acceso al contexto y al state

    const technicianOptions = technicians
      .filter(
        (tech) =>
          !selectedTechnicians.some((selected) => selected._id === tech._id)
      )
      .map(
        (tech) =>
          `<option value="${tech._id}">${tech.name || tech.username}</option>`
      )
      .join("");

    return `
      <div class="asignar-form">
        <div class="form-group">
          <label for="fecha" class="form-label">Fecha del servicio</label>
          <input type="date" id="fecha" class="form-control" value="${
            new Date().toISOString().split("T")[0]
          }" required>
        </div>
        
        <div class="form-group time-group">
          <div class="time-input">
            <label for="horaInicio" class="form-label">Hora de inicio</label>
            <input type="time" id="horaInicio" class="form-control" value="${currentHour}:${currentMinutes}" required>
          </div>
          <div class="duration-input">
            <label for="duracion" class="form-label">Duración (minutos)</label>
            <input type="number" id="duracion" class="form-control" value="60" min="30" step="15" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Técnicos Asignados</label>
          <div id="tecnicos-seleccionados-container" class="technicians-container"></div>
        </div>
        
        <div class="form-group technician-select-group">
          <div class="technician-select-wrapper">
            <select id="tecnicoSelect" class="form-control">
              <option value="">Seleccionar técnico...</option>
              ${technicianOptions}
            </select>
            <button type="button" id="addTechnician" class="add-technician-btn" title="Agregar técnico">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div class="form-group" style="margin-top: 15px; margin-bottom: 5px;">
          <button type="button" id="exportCalendar" title="Exportar calendario" style="background: #87c947; color: white; border: 2px solid #004122; width: 100%; padding: 8px 15px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: bold;">
            <i class="fas fa-file-export" style="margin-right: 8px; font-size: 16px;"></i>
            Exportar Calendario
          </button>
        </div>
      </div>
    `;
  };

  const handleAsignar = async () => {
    // No reiniciar la lista de técnicos aquí para mantener las selecciones previas
    // Verificar si estamos en modo oscuro
    const isDarkMode = document.body.classList.contains("dark-theme");

    const mostrarModal = async () => {
      // Movemos la definición de localSelectedTechnicians fuera de didOpen
      // para que sea accesible en preConfirm
      let localSelectedTechnicians = [...selectedTechnicians];

      // Mostrar el modal con SweetAlert2
      const result = await Swal.fire({
        title: "Asignar servicio a técnicos",
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
              <div class="technician-selection-container">
                <div class="technician-select-wrapper">
                  <select id="tecnicoSelect" class="form-control">
                    <option value="">Seleccionar técnico...</option>
                    ${technicians
                      .filter(
                        (tech) =>
                          !localSelectedTechnicians.some(
                            (t) => t._id === tech._id
                          )
                      )
                      .map(
                        (tech) =>
                          `<option value="${tech._id}">${
                            tech.name || tech.username
                          }</option>`
                      )
                      .join("")}
                  </select>
                  <button id="addTechnician" type="button" title="Agregar técnico" style="background: transparent; border: none; color: #87c947; margin-left: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                
                <div style="margin-top: 15px; margin-bottom: 15px; width: 100%; text-align: center;">
                  <button id="exportCalendar" type="button" title="Exportar calendario" style="background: #87c947; color: white; border: 2px solid #004122; width: 100%; padding: 10px 15px; border-radius: 5px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fas fa-file-export" style="margin-right: 8px; font-size: 18px;"></i>
                    Exportar Calendario
                  </button>
                </div>
              <div id="selectedTechnicians" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 6px;">
                ${localSelectedTechnicians
                  .map(
                    (tech) => `
                  <div class="selected-tech" style="background-color: ${
                    isDarkMode ? "#2c2e35" : "#e9f5d8"
                  }; color: ${
                      isDarkMode ? "#fff" : "#004122"
                    }; padding: 3px 10px; border-radius: 50px; display: flex; align-items: center; font-size: 0.85rem;">
                    <span>${tech.name}</span>
                    <button type="button" class="remove-technician" data-id="${
                      tech._id
                    }" style="background: none; border: none; color: ${
                      isDarkMode ? "#ff6b6b" : "#e74c3c"
                    }; margin-left: 5px; cursor: pointer; display: flex; align-items: center; padding: 0 2px;">
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
            
            <div class="mb-2">
              <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Fecha</label>
              <input type="date" id="fecha" class="form-control" value="${
                new Date().toISOString().split("T")[0]
              }" style="background-color: ${
          isDarkMode ? "#2c2e35" : "#fff"
        }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
          isDarkMode ? "#444" : "#ced4da"
        };">
            </div>
            
            <div style="display: flex; gap: 10px;">
              <div class="mb-2" style="flex: 1;">
                <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Hora de inicio</label>
                <input type="time" id="horaInicio" class="form-control" value="${new Date()
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${new Date()
          .getMinutes()
          .toString()
          .padStart(2, "0")}" style="background-color: ${
          isDarkMode ? "#2c2e35" : "#fff"
        }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
          isDarkMode ? "#444" : "#ced4da"
        };">
              </div>
              <div class="mb-2" style="flex: 1;">
                <label class="form-label mb-1" style="color: #87c947; font-weight: 500; font-size: 0.9rem;">Duración (min)</label>
                <input type="number" id="duracion" class="form-control" value="60" min="30" step="15" style="background-color: ${
                  isDarkMode ? "#2c2e35" : "#fff"
                }; color: ${isDarkMode ? "#fff" : "#333"}; border-color: ${
          isDarkMode ? "#444" : "#ced4da"
        };">
              </div>
            </div>
          </form>
        `,
        confirmButtonText: '<i class="fas fa-calendar-check"></i> Asignar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
        showCancelButton: true,
        confirmButtonColor: "#87c947",
        cancelButtonColor: isDarkMode ? "#444" : "#e7e7e7",
        customClass: {
          popup: isDarkMode ? "dark-modal" : "",
        },
        background: isDarkMode ? "#212529" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#212529",
        didOpen: () => {
          // Actualizar la lista de técnicos seleccionados en la UI
          const updateTechniciansList = () => {
            const selectedTechniciansContainer = document.getElementById(
              "selectedTechnicians"
            );
            if (!selectedTechniciansContainer) return;

            selectedTechniciansContainer.innerHTML = localSelectedTechnicians
              .map(
                (tech) => `
              <div class="selected-tech" style="background-color: ${
                isDarkMode ? "#3a3f48" : "#e9f5d8"
              }; color: ${
                  isDarkMode ? "#fff" : "#004122"
                }; padding: 3px 10px; border-radius: 50px; display: flex; align-items: center; font-size: 0.85rem;">
                <span>${tech.name}</span>
                <button type="button" class="remove-technician" data-id="${
                  tech._id
                }" style="background: none; border: none; color: ${
                  isDarkMode ? "#ff6b6b" : "#e74c3c"
                }; margin-left: 5px; cursor: pointer; display: flex; align-items: center; padding: 0 2px;">
                  <i class="fas fa-times-circle"></i>
                </button>
              </div>
            `
              )
              .join("");

            // Actualizar las opciones del selector de técnicos
            const tecnicoSelect = document.getElementById("tecnicoSelect");
            if (tecnicoSelect) {
              tecnicoSelect.innerHTML = `
                <option value="">Seleccionar técnico...</option>
                ${technicians
                  .filter(
                    (tech) =>
                      !localSelectedTechnicians.some((t) => t._id === tech._id)
                  )
                  .map(
                    (tech) =>
                      `<option value="${tech._id}">${tech.name}</option>`
                  )
                  .join("")}
              `;
            }

            // Agregar eventos a los nuevos botones de eliminar
            document.querySelectorAll(".remove-technician").forEach((btn) => {
              btn.addEventListener("click", function (e) {
                e.stopPropagation(); // Evitar que el evento burbujee
                const techId = this.getAttribute("data-id");

                // Actualizar la lista local
                localSelectedTechnicians = localSelectedTechnicians.filter(
                  (tech) => tech._id !== techId
                );

                // Actualizar el estado de React para mantener sincronizada la información
                setSelectedTechnicians([...localSelectedTechnicians]);

                // Actualizar la UI inmediatamente
                updateTechniciansList();
              });
            });
          };

          // Manejar el evento de agregar técnico
          const addTechnicianButton = document.getElementById("addTechnician");
          if (addTechnicianButton) {
            addTechnicianButton.addEventListener("click", () => {
              const select = document.getElementById("tecnicoSelect");
              const techId = select.value;

              if (!techId) return;

              const techName = select.options[select.selectedIndex].text;
              const newSelectedTech = { _id: techId, name: techName };

              // Verificar que no esté ya seleccionado (doble verificación)
              if (
                !localSelectedTechnicians.some((tech) => tech._id === techId)
              ) {
                // Agregar a la lista local
                localSelectedTechnicians.push(newSelectedTech);

                // Actualizar el estado de React para mantener sincronizada la información
                setSelectedTechnicians([...localSelectedTechnicians]);

                // Actualizar la UI inmediatamente
                updateTechniciansList();
              }
            });
          }

          // Manejar el evento de exportar calendario
          const exportCalendarButton =
            document.getElementById("exportCalendar");
          if (exportCalendarButton) {
            exportCalendarButton.addEventListener("click", () => {
              const selectedDate = document.getElementById("fecha").value;
              const formatType = Swal.fire({
                title: "Exportar Calendario",
                html: `
                  <div class="export-options">
                    <p>Seleccione el formato de exportación para la fecha: <strong>${selectedDate}</strong></p>
                    <div class="export-format-buttons" style="display: flex; justify-content: center; margin-top: 20px; gap: 15px;">
                      <button id="exportPDF" class="swal2-confirm swal2-styled" style="background-color: #87c947; padding: 12px 25px; border: 2px solid #004122; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fas fa-file-pdf" style="margin-right: 10px; font-size: 18px;"></i>PDF
                      </button>
                      <button id="exportCSV" class="swal2-confirm swal2-styled" style="background-color: #87c947; padding: 12px 25px; border: 2px solid #004122; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fas fa-file-csv" style="margin-right: 10px; font-size: 18px;"></i>CSV
                      </button>
                    </div>
                  </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: "Cancelar",
                focusCancel: false,
                didOpen: () => {
                  // Función para exportar calendario - definida aquí para tener acceso a localSelectedTechnicians y mostrarAlerta
                  const handleExport = (format) => {
                    const date = document.getElementById("fecha").value;

                    // Mostrar spinner mientras se procesa
                    Swal.fire({
                      title: "Generando exportación...",
                      html: "Por favor espere mientras preparamos su archivo.",
                      allowOutsideClick: false,
                      didOpen: () => {
                        Swal.showLoading();
                      },
                    });

                    // Llamar al endpoint de exportación
                    const techParams = localSelectedTechnicians
                      .map((t) => `&techId=${t._id}`)
                      .join("");
                    console.log(
                      `Exportando calendario para fecha ${date}, formato ${format}, técnicos: ${
                        techParams || "todos"
                      }`
                    );
                    fetch(
                      `/api/exports?date=${date}&format=${format}${techParams}`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      }
                    )
                      .then((response) => {
                        if (format === "pdf") {
                          return response.blob();
                        } else {
                          return response.text();
                        }
                      })
                      .then((data) => {
                        // Cerrar el spinner
                        Swal.close();

                        // Crear un objeto URL para el blob (para PDF)
                        if (format === "pdf") {
                          const url = URL.createObjectURL(data);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `calendario_${date}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          URL.revokeObjectURL(url);
                          a.remove();

                          mostrarAlerta({
                            icon: "success",
                            title: "Exportación PDF completada",
                            timer: 2000,
                            showConfirmButton: false,
                          });
                        } else {
                          // Para CSV
                          const url = window.URL.createObjectURL(
                            new Blob([data], { type: "text/csv" })
                          );
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `calendario_${date}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          URL.revokeObjectURL(url);
                          a.remove();

                          mostrarAlerta({
                            icon: "success",
                            title: "Exportación CSV completada",
                            timer: 2000,
                            showConfirmButton: false,
                          });
                        }
                      })
                      .catch((error) => {
                        console.error("Error al exportar:", error);
                        Swal.fire({
                          icon: "error",
                          title: "Error de exportación",
                          text: "No se pudo generar el archivo de exportación. Por favor intente nuevamente.",
                        });
                      });
                  };

                  // Agregar eventos a los botones de formato
                  document
                    .getElementById("exportPDF")
                    .addEventListener("click", () => {
                      handleExport("pdf");
                      Swal.close();
                    });
                  document
                    .getElementById("exportCSV")
                    .addEventListener("click", () => {
                      handleExport("csv");
                      Swal.close();
                    });
                },
              });
            });
          }

          // Inicializar la lista al abrir el modal
          updateTechniciansList();
        },
        preConfirm: () => {
          const fecha = document.getElementById("fecha").value;
          const horaInicio = document.getElementById("horaInicio").value;
          const duracion = document.getElementById("duracion").value;

          // Validación mínima
          if (!fecha || !horaInicio || !duracion) {
            Swal.showValidationMessage(
              "Por favor complete todos los campos de fecha y hora"
            );
            return false;
          }

          // Verificar que hay al menos un técnico seleccionado
          // Ahora localSelectedTechnicians está accesible aquí
          if (
            !localSelectedTechnicians ||
            localSelectedTechnicians.length === 0
          ) {
            Swal.showValidationMessage("Debe seleccionar al menos un técnico");
            return false;
          }

          // IMPORTANTE: Sincronizar el estado de React con la variable local antes de continuar
          setSelectedTechnicians([...localSelectedTechnicians]);

          return {
            fecha,
            horaInicio,
            duracion,
            tecnicosSeleccionados: [...localSelectedTechnicians],
          };
        },
      });

      return result;
    };

    const result = await mostrarModal();

    // Solo proceder con la asignación si el usuario confirmó el modal
    if (!result || !result.isConfirmed) {
      console.log(
        "Modal cancelado o cerrado sin confirmación. No se realizará asignación."
      );
      return; // Salir de la función para no ejecutar nada más
    }

    // Obtener los valores del formulario
    const formValues = result.value;

    // Si llegamos aquí, el usuario confirmó el modal
    console.log("Modal confirmado, procediendo con la asignación de servicio");
    const { fecha, horaInicio, duracion, tecnicosSeleccionados } = formValues;

    // Usamos los técnicos seleccionados que nos devolvió el modal
    // Si no hay tecnicosSeleccionados, usamos el estado React actual como respaldo
    const tecnicos = tecnicosSeleccionados || selectedTechnicians;

    // Crear un evento en el calendario para cada técnico seleccionado
    const resultados = [];

    // Guardamos la cantidad de técnicos para mostrar mensaje correcto
    const cantidadTecnicos = tecnicos.length;

    console.log("Asignando servicios a técnicos:", {
      cantidad: cantidadTecnicos,
      tecnicos: tecnicos,
      fecha,
      horaInicio,
      duracion,
    });

    for (const tecnico of tecnicos) {
      // Create calendar event with explicit date from the modal input
      const fechaInicio = new Date(`${fecha}T${horaInicio}`);
      const fechaFin = new Date(
        fechaInicio.getTime() + parseInt(duracion) * 60000
      );

      console.log("Fechas creadas para el servicio:", {
        fechaString: `${fecha}T${horaInicio}`,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
      });

      const eventoCalendario = {
        id: servicio._id || servicio.id, // Usar el ID real del servicio
        title: `${servicio.nombre || servicio.serviceType} - ${
          servicio.clientName
        }`,
        start: fechaInicio.toISOString(),
        end: fechaFin.toISOString(),
        resourceId: tecnico._id,
        backgroundColor: "#87c947",
        borderColor: "#87c947",
        className: "estado-confirmado calendar-event-interactive", // Agregar clases para estilo e interactividad
        textColor: "white",
        display: "block",
        editable: true, // Permitir edición
        durationEditable: true, // Permitir cambio de duración
        startEditable: true, // Permitir cambio de hora de inicio
        extendedProps: {
          estado: "confirmado",
          status: "confirmed",
          descripcion: servicio.descripcion,
          description: servicio.descripcion,
          cliente: servicio.clientName,
          clientName: servicio.clientName,
          telefono: servicio.clientPhone,
          clientPhone: servicio.clientPhone,
          email: servicio.clientEmail,
          clientEmail: servicio.clientEmail,
          direccion: servicio.address,
          address: servicio.address,
          serviceId: servicio._id || servicio.id,
          // Agregar las fechas explícitamente para asegurarnos que se conservan
          scheduledStart: fechaInicio.toISOString(),
          scheduledEnd: fechaFin.toISOString(),
          fecha: fecha, // Preservar la fecha original seleccionada
        },
      };

      // Asegurarnos de usar el ID correcto del servicio
      const serviceId = servicio._id || servicio.id;

      // Guardar técnicos seleccionados para enviar al backend
      // Usamos los técnicos del bucle actual (tecnicos) en lugar de selectedTechnicians
      const technicianIds = tecnicos.map((tech) => tech._id);

      // Agregar el técnico actual como técnico principal para este evento específico
      eventoCalendario.technicianIds = technicianIds;

      console.log("Configurando evento para técnico:", {
        tecnico: tecnico.name,
        tecnicoId: tecnico._id,
        technicianIds,
        serviceId,
      });

      try {
        // Asignar servicio con el técnico actual como principal
        const resultado = await onAsignarServicio(
          eventoCalendario,
          serviceId,
          technicianIds
        );
        resultados.push(resultado);
      } catch (error) {
        console.error(
          "Error al asignar servicio al técnico:",
          tecnico.name,
          error
        );
      }
    }

    // Verificar si todas las asignaciones fueron exitosas
    const todasExitosas = resultados.every((res) => res === true);

    // Mensaje personalizado según la cantidad de técnicos
    let mensajeExito;
    if (cantidadTecnicos === 1) {
      mensajeExito = `El servicio ha sido asignado correctamente a ${tecnicos[0].name}`;
    } else if (cantidadTecnicos > 1) {
      mensajeExito = `El servicio ha sido asignado a los ${cantidadTecnicos} técnicos seleccionados`;
    } else {
      mensajeExito = "El servicio ha sido asignado correctamente";
    }

    mostrarAlerta({
      icon: todasExitosas ? "success" : "warning",
      title: todasExitosas ? "Servicio Asignado" : "Asignación Parcial",
      text: todasExitosas
        ? mensajeExito
        : "El servicio fue asignado a algunos técnicos, pero hubo errores",
      timer: 2500,
      showConfirmButton: false,
    });

    // Solo limpiamos la selección después de una asignación exitosa
    if (todasExitosas) {
      setSelectedTechnicians([]);
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div className="contenido-servicio">
        <div className="d-flex justify-content-between align-items-start">
          <h5 style={{ flex: 1 }}>
            <i className="fas fa-tag icon-primary"></i>{" "}
            {formatServiceName(servicio.serviceType || servicio.nombre)}
          </h5>
        </div>
        <p className="mb-1">
          <i className="fas fa-user icon-primary"></i> {servicio.clientName}
        </p>
        <p className="mb-1">
          {" "}
          <i className="fas fa-calendar-alt icon-primary"></i>{" "}
          {servicio.preferredDate
            ? new Date(servicio.preferredDate).toLocaleDateString()
            : "No especificada"}
        </p>
        <p className="mb-0 descripcion-truncada">
          <i className="fas fa-info-circle icon-primary"></i>{" "}
          {servicio.descripcion || servicio.description || "Sin descripción"}
        </p>
      </div>
      <hr
        style={{
          margin: "10px 0",
          borderTop: "1px solid rgba(135, 201, 71, 0.2)",
          width: "100%",
          alignSelf: "center",
        }}
      />
      <div className="botones-container">
        <button
          className="btn-info-circle"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          title="Ver detalles"
        >
          <i className="fas fa-info-circle"></i>
        </button>
        <button
          className="btn-calendar-circle"
          onClick={(e) => {
            e.stopPropagation();
            handleAsignar();
          }}
          title="Asignar servicio"
        >
          <i className="fas fa-calendar-alt"></i>
        </button>
      </div>
    </div>
  );
};

export default ServicioCard;
