import React, { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import esLocale from "@fullcalendar/core/locales/es";
import Swal from "sweetalert2";
import Sidebar from "./Sidebar";
import CalendarHeader from "./CalendarHeader";
import { useAlertas } from "../../hooks/useAlertas";
import { useAuth } from "../../../hooks/useAuth";
import { useCalendar } from "../../../hooks/useCalendar";
import { useServices } from "../../../hooks/useServices";
import { serviceService } from "../../../client/services/serviceService";
import { userService } from "../../../client/services/userService";
import "./Calendar.css";
import "./styles/forms.css";

const API_MOCK = {
  eventos: [
    {
      titulo: "Prueba!!!",
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 3600000), // 1 hora después
      color: "#87c947",
      estado: "confirmado",
      descripcion: "Servicio de prueba",
    },
    // Más eventos de ejemplo...
  ],
};

const Calendar = () => {
  // Services state and API integration
  const { services, updateService, getAllServices } = useServices();
  const [localServices, setLocalServices] = useState([]);
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const { mostrarAlerta } = useAlertas();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ x: 0, y: 0 });
  const [mostrarMenuContextual, setMostrarMenuContextual] = useState(false);
  const [mostrarMenuContextualTecnico, setMostrarMenuContextualTecnico] =
    useState(false);  useEffect(() => {
    // Cargar servicios pendientes del localStorage
    const serviciosGuardados =
      JSON.parse(localStorage.getItem("serviciosPendientes")) || [];
    setServiciosPendientes(serviciosGuardados);

    // Cargar eventos del localStorage
    const eventosGuardados = JSON.parse(localStorage.getItem("eventos")) || [];
    setEventos(eventosGuardados);

    // Fetch technicians from database
    const fetchTechnicians = async () => {
      try {
        console.log('Fetching technicians from database...');
        const techniciansData = await userService.getTechnicians();
        console.log('Technicians fetched:', techniciansData);
        
        const formattedTechnicians = techniciansData.map((tech, index) => ({
          id: tech._id,
          title: tech.name,
          order: index + 1,
        }));
        
        setTecnicos(formattedTechnicians);
        localStorage.setItem("tecnicos", JSON.stringify(formattedTechnicians));
      } catch (error) {
        console.error('Error fetching technicians:', error);
        // Fallback to empty array if fetch fails
        setTecnicos([]);
      }
    };

    fetchTechnicians();

    // Fetch services from API - force refresh
    if (getAllServices) {
      console.log('Calling getAllServices with force=true');
      getAllServices(true);
    }

    // Fallback: Direct API call if useServices doesn't work
    const fetchServicesDirectly = async () => {
      try {
        console.log('Making direct API call to fetch services');
        const response = await serviceService.getServices();
        console.log('Direct API response:', response);
          if (response && Array.isArray(response) && response.length > 0) {
          // Set the local services state so the existing useEffect can process them
          setLocalServices(response);
          console.log('Set localServices to:', response);
        }
      } catch (error) {
        console.error('Direct API call failed:', error);
      }
    };    // Call direct API after a short delay to allow useServices to work first
    const timeoutId = setTimeout(fetchServicesDirectly, 2000);

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);  // Load pending services when services change
  useEffect(() => {
    const currentServices = services && services.length > 0 ? services : localServices;
    console.log('Services updated:', currentServices);
    console.log('Services length:', currentServices?.length);
    console.log('Services type:', typeof currentServices);
    
    if (currentServices && Array.isArray(currentServices) && currentServices.length > 0) {
      console.log('Processing services...');
      const pendingServices = currentServices
        .filter((service) => service.status === "pending")
        .map((service) => ({
          id: service._id, // Use MongoDB _id
          nombre: service.serviceType,
          descripcion: service.description,
          duracion: 60,
          color: "#ffd54f",
          estado: "pendiente",
          clientName: service.name,
          clientEmail: service.email,
          clientPhone: service.phone,
          address: service.address,
          preferredDate: service.preferredDate,
        }));
      setServiciosPendientes(pendingServices);
      console.log('Pending services:', pendingServices);

      // Convert pending services to calendar events format
      const calendarEvents = currentServices
        .filter((service) => service.status === "pending")
        .map((service) => ({
          id: service._id,
          title: service.serviceType,
          start: new Date(service.preferredDate),
          end: new Date(new Date(service.preferredDate).getTime() + 3600000), // 1 hour duration
          color: "#ffd54f",
          description: service.description,
          extendedProps: {
            clientName: service.name,
            clientEmail: service.email,
            clientPhone: service.phone,
            address: service.address,
            status: service.status
          }
        }));

      console.log('Calendar events:', calendarEvents);

      // Add pending services to eventos state
      setEventos(prevEventos => {
        // Filter out any existing pending services to avoid duplicates
        const filteredEvents = prevEventos.filter(evento => !evento.extendedProps?.status || evento.extendedProps.status !== 'pending');
        const newEvents = [...filteredEvents, ...calendarEvents];
        console.log('Updated eventos:', newEvents);
        return newEvents;
      });
    } else {
      console.log('No services or services is not an array:', currentServices);
    }
  }, [services, localServices]);

  const handleAgregarTecnico = async () => {
    const { value: nombreTecnico } = await mostrarAlerta({
      title: "Agregar Técnico",
      html: `
        <form id="tecnicoForm" class="text-left">
          <div class="mb-3">
            <input 
              type="text" 
              id="nombreTecnico" 
              placeholder="Nombre del técnico" 
              class="form-control" 
              required 
            >
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      background: "#ffffff",
      color: "#004122",
      preConfirm: () => {
        const nombre = document.getElementById("nombreTecnico").value;
        if (!nombre) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre del técnico",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }
        return nombre;
      },
    });

    if (nombreTecnico) {
      const tecnicosActuales = tecnicos;

      // Encontrar el orden más bajo actual y restar 1
      const minOrder = Math.min(...tecnicosActuales.map((t) => t.order || 0));

      // Crear el nuevo técnico con orden menor
      const nuevoTecnico = {
        id: (
          Math.max(...tecnicosActuales.map((t) => parseInt(t.id)), 0) + 1
        ).toString(),
        title: nombreTecnico,
        order: minOrder - 1, // Esto hará que aparezca a la derecha
      };

      // Agregar el nuevo técnico al array
      const tecnicosActualizados = [...tecnicosActuales, nuevoTecnico];

      // Actualizar el estado
      setTecnicos(tecnicosActualizados);

      mostrarAlerta({
        icon: "success",
        title: "Técnico Agregado",
        text: "El técnico ha sido agregado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };
  const handleAgregarServicio = async (nuevoServicio) => {
    try {
      // Create service in database
      const createdService = await serviceService.saveService({
        name: nuevoServicio.clientName,
        email: nuevoServicio.clientEmail,
        phone: nuevoServicio.clientPhone,
        address: nuevoServicio.address || "No especificada",
        serviceType: nuevoServicio.serviceType || "other",
        description: nuevoServicio.descripcion,
        preferredDate: nuevoServicio.preferredDate || new Date().toISOString(),
        document: nuevoServicio.document || "N/A",
        status: "pending",
      });

      // Map MongoDB document to local service format
      const localService = {
        id: createdService._id,
        nombre: createdService.serviceType,
        descripcion: createdService.description,
        duracion: 60, // Default duration in minutes
        color: "#ffd54f", // Color for pending state
        estado: "pendiente",
        clientName: createdService.name,
        clientEmail: createdService.email,
        clientPhone: createdService.phone,
        address: createdService.address,
        preferredDate: createdService.preferredDate,
      };

      // Add to local state
      const serviciosActualizados = [...serviciosPendientes, localService];
      setServiciosPendientes(serviciosActualizados);

      return createdService;
    } catch (error) {
      console.error("Error al crear servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el servicio. Por favor, intente nuevamente.",
        confirmButtonColor: "#87c947",
      });
      throw error;
    }
  };
  const handleEliminarServicio = async (servicioId) => {
    try {
      await serviceService.deleteService(servicioId);
      const serviciosActualizados = serviciosPendientes.filter(
        (servicio) => servicio.id !== servicioId
      );
      setServiciosPendientes(serviciosActualizados);
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el servicio. Por favor, intente nuevamente.",
      });
    }
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    const tecnicoDestino = tecnicos.find(
      (t) => t.id === event.getResources()[0]?.id
    );

    // Si se canceló el drop, revertir el movimiento
    if (!tecnicoDestino) {
      info.revert();
      return;
    }

    const result = await mostrarAlerta({
      title: "¿Mover Servicio?",
      html: `
        <div class="text-left">
          <p style="color: #004122;">
            ¿Está seguro de que desea mover el servicio <strong>${event.title}</strong> al técnico <strong>${tecnicoDestino.title}</strong>?
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, mover",
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
        htmlContainer: "swal2-html-container",
      },
    });

    if (result.isConfirmed) {
      // Actualizar el evento en tu estado
      const eventosActualizados = eventos.map((ev) =>
        ev.id === event.id
          ? {
              ...ev,
              start: event.startStr,
              end: event.endStr,
              resourceId: event.getResources()[0]?.id,
            }
          : ev
      );
      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Servicio Movido",
        text: "El servicio ha sido reasignado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    } else {
      info.revert();
    }
  };

  const handleEventReceive = (info) => {
    const { event } = info;
    const servicioArrastrado = serviciosPendientes.find(
      (servicio) => servicio.id === parseInt(event.id)
    );

    if (servicioArrastrado) {
      const nuevoEvento = {
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        backgroundColor: servicioArrastrado.color,
        borderColor: servicioArrastrado.color,
        resourceId: event.getResources()[0]?.id,
        extendedProps: {
          descripcion: servicioArrastrado.descripcion,
          tecnico: servicioArrastrado.tecnico,
        },
      };

      const eventosActualizados = [...eventos, nuevoEvento];
      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      handleEliminarServicio(parseInt(event.id));
    }
  };

  const handleEditarTecnico = async (tecnico) => {
    try {
      const { value: formValues } = await mostrarAlerta({
        title: "Editar Técnico",
        html: `
                <form id="editTecnicoForm">
                    <div class="form-group">
                        <label for="nombreTecnico" class="form-label">Nombre del Técnico</label>
                        <input type="text" id="nombreTecnico" class="form-control" value="${tecnico.title}" required>
                    </div>
                </form>
            `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#87c947",
        cancelButtonColor: "#e74c3c",
        preConfirm: () => {
          const nombre = document.getElementById("nombreTecnico").value;
          if (!nombre) {
            Swal.showValidationMessage(
              "Por favor ingrese el nombre del técnico"
            );
            return false;
          }
          return { nombre };
        },
      });

      if (formValues) {
        // Actualizar el técnico en el estado local
        const tecnicosActualizados = tecnicos.map((t) =>
          t.id === tecnico.id ? { ...t, title: formValues.nombre } : t
        );

        setTecnicos(tecnicosActualizados);
        localStorage.setItem("tecnicos", JSON.stringify(tecnicosActualizados));

        mostrarAlerta({
          icon: "success",
          title: "Técnico actualizado exitosamente",
          confirmButtonColor: "#87c947",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Hubo un error al editar el técnico",
        confirmButtonColor: "#87c947",
      });
    }
  };

  const handleEliminarTecnico = async (tecnico) => {
    try {
      const result = await mostrarAlerta({
        title: "¿Estás seguro?",
        text: `¿Deseas eliminar al técnico ${tecnico.title}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#87c947",
        cancelButtonColor: "#e74c3c",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        // Eliminar el técnico del estado local
        const tecnicosActualizados = tecnicos.filter(
          (t) => t.id !== tecnico.id
        );
        setTecnicos(tecnicosActualizados);
        localStorage.setItem("tecnicos", JSON.stringify(tecnicosActualizados));

        mostrarAlerta({
          icon: "success",
          title: "Técnico eliminado exitosamente",
          confirmButtonColor: "#87c947",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Hubo un error al eliminar el técnico",
        confirmButtonColor: "#87c947",
      });
    }
  };

  // Función para mostrar el menú contextual
  const showContextMenu = (event, tecnico) => {
    event.preventDefault();

    // Eliminar menú contextual existente si hay alguno
    const existingMenu = document.querySelector(".context-menu");
    if (existingMenu) {
      existingMenu.remove();
    }

    // Crear nuevo menú contextual
    const contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";

    // Importante: No usar onclick en el string HTML
    contextMenu.innerHTML = `
        <div class="context-menu-item edit">
            <i class="fas fa-edit"></i>
            Editar
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item delete">
            <i class="fas fa-trash"></i>
            Eliminar
        </div>
    `;

    // Posicionar el menú
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;

    // Agregar event listeners después de crear el menú
    const editButton = contextMenu.querySelector(".context-menu-item.edit");
    const deleteButton = contextMenu.querySelector(".context-menu-item.delete");

    editButton.addEventListener("click", () => {
      handleEditarTecnico(tecnico);
      contextMenu.remove();
    });

    deleteButton.addEventListener("click", () => {
      handleEliminarTecnico(tecnico);
      contextMenu.remove();
    });

    // Agregar al DOM
    document.body.appendChild(contextMenu);

    // Cerrar el menú al hacer clic fuera
    document.addEventListener("click", function closeMenu(e) {
      if (!contextMenu.contains(e.target)) {
        contextMenu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  };

  // Agregar el evento contextmenu a los elementos de técnico
  useEffect(() => {
    const tecnicoElements = document.querySelectorAll(".fc-resource");
    tecnicoElements.forEach((element) => {
      element.addEventListener("contextmenu", (e) => {
        const tecnicoId = element.getAttribute("data-resource-id");
        const tecnico = tecnicos.find((t) => t.id === tecnicoId);
        if (tecnico) {
          showContextMenu(e, tecnico);
        }
      });
    });
  }, [tecnicos]);
  // Contenido personalizado para las etiquetas de recursos
  const resourceLabelContent = useCallback((arg) => {
    // Obtener el nombre completo y dividirlo en palabras
    const fullName = arg.resource.title;
    const names = fullName.split(" ");

    // Obtener las iniciales de cada palabra
    const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");

    return {
      html: `<div class="resource-label" 
              style="cursor: context-menu;" 
              data-resource-id="${arg.resource.id}" 
              title="${fullName}">
              <div class="tecnico-nombre">
                <span class="tecnico-initials">${initials}</span>
              </div>
          </div>`,
    };
  }, []);

  const handleDateSelect = async (selectInfo) => {
    const tecnico = tecnicos.find((t) => t.id === selectInfo.resource.id);
    const fechaInicio = new Date(selectInfo.start);
    const fechaFin = new Date(selectInfo.end);

    const estadosServicio = {
      confirmado: {
        nombre: "Confirmado",
        color: "#87c947",
        icon: "fa-check",
        gradient: "linear-gradient(135deg, #87c947, #66b417)",
      },
      cancelado: {
        nombre: "Cancelado",
        color: "#e74c3c",
        icon: "fa-times",
        gradient: "linear-gradient(135deg, #e74c3c, #c0392b)",
      },
      pendiente: {
        nombre: "Pendiente",
        color: "#ffd54f",
        icon: "fa-clock",
        gradient: "linear-gradient(135deg, #ffd54f, #f1c40f)",
      },
      almuerzo: {
        nombre: "Hora de Almuerzo",
        color: "#3498db",
        icon: "fa-utensils",
        gradient: "linear-gradient(135deg, #3498db, #2980b9)",
      },
      especial: {
        nombre: "Situación Especial",
        color: "#9b59b6",
        icon: "fa-exclamation-circle",
        gradient: "linear-gradient(135deg, #9b59b6, #8e44ad)",
      },
    };

    const { value: formValues } = await mostrarAlerta({
      title: "Agregar Servicio",
      html: `
      <form id="servicioForm">
        <input 
          type="text" 
          id="nombreServicio" 
          class="form-control" 
          placeholder="Nombre del servicio"
          required
        >
        
        <textarea 
          id="descripcionServicio" 
          class="form-control"
          placeholder="Descripción del servicio"
        ></textarea>
        
        <div class="estados-section">
          <div id="estadosContainer">
            ${Object.entries(estadosServicio)
              .map(
                ([key, estado]) => `
                <button 
                  type="button" 
                  class="estado-btn" 
                  data-estado="${key}" 
                  style="background: ${estado.gradient};"
                >
                  <i class="fas ${estado.icon}"></i>
                  ${estado.nombre}
                </button>
              `
              )
              .join("")}
          </div>
          <input type="hidden" id="estadoServicio" value="">
        </div>
        
        <div class="text-muted">
          <small><i class="fas fa-user"></i>${tecnico.title}</small>
          <small><i class="fas fa-clock"></i>${fechaInicio.toLocaleTimeString()}</small>
          <small><i class="fas fa-hourglass-end"></i>${fechaFin.toLocaleTimeString()}</small>
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Guardar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      customClass: {
        popup: "form-asignar-servicio",
      },
      didOpen: () => {
        const btns = Swal.getPopup().querySelectorAll(".estado-btn");
        btns.forEach((btn) => {
          const estado = btn.dataset.estado;

          // Agregar evento click
          btn.addEventListener("click", () => {
            // Remover estado activo de todos los botones
            btns.forEach((b) => {
              b.style.opacity = "0.6";
              b.classList.remove("active");
            });

            // Activar el botón seleccionado
            btn.style.opacity = "1";
            btn.classList.add("active");

            // Actualizar el valor del input oculto
            document.getElementById("estadoServicio").value = estado;
          });

          // Efectos hover
          btn.addEventListener("mouseover", () => {
            if (!btn.classList.contains("active")) {
              btn.style.opacity = "0.8";
            }
          });

          btn.addEventListener("mouseout", () => {
            if (!btn.classList.contains("active")) {
              btn.style.opacity = "0.6";
            }
          });
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombreServicio").value;
        const descripcion = document.getElementById(
          "descripcionServicio"
        ).value;
        const estado = document.getElementById("estadoServicio").value;

        if (!nombre) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre del servicio",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        if (!estado) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor seleccione un estado para el servicio",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        return {
          nombre,
          descripcion,
          estado,
          color: estadosServicio[estado].color,
        };
      },
    });

    if (formValues) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      // Crear evento con la clase correcta para el estado
      const nuevoEvento = {
        id: `evento-${Date.now()}`,
        title: formValues.nombre,
        start: selectInfo.start,
        end: selectInfo.end,
        resourceId: selectInfo.resource.id,
        extendedProps: {
          descripcion: formValues.descripcion,
          estado: formValues.estado,
        },
        backgroundColor: formValues.color,
        borderColor: formValues.color,
        textColor: "white",
        className: `estado-${formValues.estado}`,
        display: "block",
      };

      // Agregar evento al estado
      setEventos((prevEventos) => {
        const eventosActualizados = [...prevEventos, nuevoEvento];
        localStorage.setItem("eventos", JSON.stringify(eventosActualizados));
        return eventosActualizados;
      });

      calendarApi.addEvent(nuevoEvento);
    }
  };

  const handleEventClick = (info) => {
    const evento = info.event;
    const tecnico = tecnicos.find((t) => t.id === evento.getResources()[0]?.id);
    const fechaInicio = new Date(evento.start);
    const fechaFin = new Date(evento.end);

    mostrarAlerta({
      title: evento.title,
      html: `
      <div class="detalles-content">
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-user"></i>
            <span>Técnico:</span>
          </div>
          <div class="detalle-value">${tecnico?.title}</div>
        </div>
        
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-clock"></i>
            <span>Horario:</span>
          </div>
          <div class="detalle-value">
            <div>Inicio: ${fechaInicio.toLocaleTimeString()}</div>
            <div>Fin: ${fechaFin.toLocaleTimeString()}</div>
          </div>
        </div>
        
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-align-left"></i>
            <span>Descripción:</span>
          </div>
          <div class="detalle-value">
            ${evento.extendedProps.descripcion || "Sin descripción"}
          </div>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i> Editar',
      cancelButtonText: '<i class="fas fa-trash"></i> Eliminar',
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#fff",
      customClass: {
        popup: "detalles-servicio",
        actions: "detalles-actions",
        confirmButton: "detalles-confirm",
        cancelButton: "detalles-cancel",
      },
      didOpen: () => {
        // Asegurarse de que los botones tengan los estilos correctos
        const confirmButton = Swal.getConfirmButton();
        const cancelButton = Swal.getCancelButton();

        if (confirmButton) {
          confirmButton.style.flex = "1";
        }
        if (cancelButton) {
          cancelButton.style.flex = "1";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleEditarServicio(evento);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleEliminarServicioCalendario(evento);
      }
    });
  };

  const handleEditarServicio = async (evento) => {
    const tecnico = tecnicos.find((t) => t.id === evento.getResources()[0]?.id);
    const fechaInicio = new Date(evento.start);
    const fechaFin = new Date(evento.end);

    const estadosServicio = {
      confirmado: {
        nombre: "Confirmado",
        color: "#87c947",
        icon: "fa-check",
        gradient: "linear-gradient(135deg, #87c947, #66b417)",
      },
      cancelado: {
        nombre: "Cancelado",
        color: "#e74c3c",
        icon: "fa-times",
        gradient: "linear-gradient(135deg, #e74c3c, #c0392b)",
      },
      pendiente: {
        nombre: "Pendiente",
        color: "#ffd54f",
        icon: "fa-clock",
        gradient: "linear-gradient(135deg, #ffd54f, #f1c40f)",
      },
      almuerzo: {
        nombre: "Hora de Almuerzo",
        color: "#3498db",
        icon: "fa-utensils",
        gradient: "linear-gradient(135deg, #3498db, #2980b9)",
      },
      especial: {
        nombre: "Situación Especial",
        color: "#9b59b6",
        icon: "fa-exclamation-circle",
        gradient: "linear-gradient(135deg,rgb(185, 63, 159), #8e44ad)",
      },
    };

    const { value: formValues } = await mostrarAlerta({
      title: "Editar Servicio",
      html: `
      <form id="servicioForm" class="text-left">
        <div class="mb-3">
          <input type="text" id="nombreServicio" class="form-control" placeholder="Nombre del servicio" required style="border-color: #c5f198;" value="${
            evento.title
          }">
        </div>
        
        <div class="mb-3">
          <textarea id="descripcionServicio" class="form-control" placeholder="Descripción del servicio" style="border-color: #c5f198;">${
            evento.extendedProps.descripcion || ""
          }</textarea>
        </div>
        
        <div class="mb-3">
          <label class="form-label required" style="color: #004122;">Estado del Servicio</label>
          <div id="estadosContainer">
            ${Object.entries(estadosServicio)
              .map(
                ([key, estado]) => `
                <button type="button" class="estado-btn ${
                  key === evento.extendedProps.estado ? "active" : ""
                }" 
                  data-estado="${key}" 
                  style="background: ${estado.gradient}; color: ${
                  key === "pendiente" ? "#2c3e50" : "white"
                }; opacity: ${
                  key === evento.extendedProps.estado ? "1" : "0.6"
                }">
                  <i class="fas ${estado.icon}"></i>
                  <span>${estado.nombre}</span>
                </button>
              `
              )
              .join("")}
          </div>
          <input type="hidden" id="estadoServicio" value="${
            evento.extendedProps.estado || ""
          }">
        </div>
        
        <div class="text-muted">
          <small><i class="fas fa-user"></i> Técnico: ${tecnico?.title}</small>
          <small><i class="fas fa-clock"></i> Inicio: ${fechaInicio.toLocaleTimeString()}</small>
          <small><i class="fas fa-hourglass-end"></i> Fin: ${fechaFin.toLocaleTimeString()}</small>
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Guardar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      background: "#ffffff",
      color: "#004122",
      customClass: {
        popup: "form-asignar-servicio",
      },
      didOpen: () => {
        const btns = Swal.getPopup().querySelectorAll(".estado-btn");
        btns.forEach((btn) => {
          const estado = btn.dataset.estado;
          const color = estadosServicio[estado].color;
          const colorHover = color
            .replace(")", ", 0.8)")
            .replace("rgb", "rgba");

          btn.addEventListener("mouseover", () => {
            btn.style.backgroundColor = colorHover;
            btn.style.transform = "translateY(-1px)";
            btn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          });

          btn.addEventListener("mouseout", () => {
            btn.style.backgroundColor = color;
            btn.style.transform = "translateY(0)";
            btn.style.boxShadow = "none";
          });

          btn.addEventListener("click", () => {
            btns.forEach((b) => (b.style.opacity = "0.6"));
            btn.style.opacity = "1";
            btn.classList.add("active");
            document.getElementById("estadoServicio").value = estado;
          });
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombreServicio").value;
        const descripcion = document.getElementById(
          "descripcionServicio"
        ).value;
        const estado = document.getElementById("estadoServicio").value;

        if (!nombre) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre del servicio",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        if (!estado) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor seleccione un estado para el servicio",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        return {
          nombre,
          descripcion,
          estado,
          color: estadosServicio[estado].color,
        };
      },
    });

    if (formValues) {
      // Actualizar el evento en FullCalendar
      evento.setProp("title", formValues.nombre);
      evento.setExtendedProp("descripcion", formValues.descripcion);
      evento.setExtendedProp("estado", formValues.estado);
      evento.setProp("backgroundColor", formValues.color);
      evento.setProp("borderColor", formValues.color);
      evento.setProp("textColor", "white");

      // Eliminar clases existentes de estados y agregar la nueva
      const clasesActuales = evento.classNames || [];
      const clasesEstados = clasesActuales.filter(
        (clase) => !clase.startsWith("estado-")
      );
      clasesEstados.push(`estado-${formValues.estado}`);
      evento.setProp("classNames", clasesEstados);

      // Actualizar el evento en el estado
      const eventosActualizados = eventos.map((ev) =>
        ev.id === evento.id
          ? {
              ...ev,
              title: formValues.nombre,
              extendedProps: {
                ...ev.extendedProps,
                descripcion: formValues.descripcion,
                estado: formValues.estado,
              },
              backgroundColor: formValues.color,
              borderColor: formValues.color,
              className: `estado-${formValues.estado}`, // Usar className en lugar de classNames
            }
          : ev
      );

      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

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
  };

  const handleEliminarServicioCalendario = async (evento) => {
    const result = await mostrarAlerta({
      title: "¿Eliminar Servicio?",
      text: `¿Está seguro de que desea eliminar el servicio "${evento.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#87c947",
      background: "#ffffff",
      color: "#004122",
    });

    if (result.isConfirmed) {
      const eventosActualizados = eventos.filter((ev) => ev.id !== evento.id);
      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Servicio Eliminado",
        text: "El servicio ha sido eliminado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };
  const handleAsignarServicio = async (eventoCalendario, servicioId) => {
    try {
      // Update service in MongoDB
      const updatedService = await serviceService.updateService(servicioId, {
        status: "confirmed",
        assignedTechnician: eventoCalendario.resourceId,
        scheduledStart: eventoCalendario.start,
        scheduledEnd: eventoCalendario.end,
      });

      // Update UI state
      setEventos((prevEventos) => [...prevEventos, eventoCalendario]);
      setServiciosPendientes((prevServicios) =>
        prevServicios.filter((s) => s.id !== servicioId)
      );

      // Save events to localStorage for now (this can be moved to MongoDB later)
      const eventosActualizados = [...eventos, eventoCalendario];
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      return true;
    } catch (error) {
      console.error("Error al asignar servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo asignar el servicio. Por favor, intente nuevamente.",
      });
      return false;
    }
  };

  const handleDateClick = (info) => {
    if (
      info.view.type === "dayGridMonth" ||
      info.view.type === "multiMonthYear"
    ) {
      info.view.calendar.changeView("resourceTimeGridDay", info.date);
    }
  };

  // Función para validar eventos
  const validateEvents = (rawEvents) => {
    return rawEvents.filter((event) => {
      return (
        event &&
        event.title &&
        event.start &&
        typeof event.title === "string" &&
        (event.start instanceof Date || typeof event.start === "string")
      );
    });
  };

  // Manejador de eventos montados
  const handleEventDidMount = (info) => {
    try {
      // Validar que el evento tenga las propiedades necesarias
      if (!info.event.display) {
        info.event.setDisplay("auto");
      }

      // Aplicar clase de estado si no está presente
      const estado = info.event.extendedProps?.estado;
      if (estado) {
        const claseEstado = `estado-${estado}`;
        if (!info.el.classList.contains(claseEstado)) {
          info.el.classList.add(claseEstado);
        }

        // Establecer el color de fondo basado en el estado si no se ha establecido
        if (!info.event.backgroundColor) {
          info.event.setProp("backgroundColor", getColorByEstado(estado));
          info.event.setProp("borderColor", getColorByEstado(estado));
          info.event.setProp("textColor", "white");
        }
      }
    } catch (error) {
      console.error("Error al montar evento:", error);
      console.log("Evento problemático:", info.event);
    }
  };

  // Función para manejar el clic derecho en un servicio
  const handleContextMenu = (e, servicio) => {
    e.preventDefault(); // Importante para prevenir el menú contextual del navegador

    // Establece el servicio seleccionado
    setServicioSeleccionado(servicio);

    // Posiciona el menú donde se hizo clic
    setPosicionMenu({ x: e.clientX, y: e.clientY });

    // Muestra el menú
    setMostrarMenuContextual(true);

    // Oculta cualquier otro menú contextual que pudiera estar abierto
    setMostrarMenuContextualTecnico(false);
  };

  // En algún lugar de tu componente, añade un manejador para cerrar el menú cuando se hace clic en otro lugar
  useEffect(() => {
    const handleClickFuera = () => {
      setMostrarMenuContextual(false);
    };

    document.addEventListener("click", handleClickFuera);

    return () => {
      document.removeEventListener("click", handleClickFuera);
    };
  }, []);

  // Manejar cuando un evento se redimensiona
  const handleEventResize = (info) => {
    // Actualizar el evento en tu estado
    const updatedEventos = eventos.map((evento) => {
      if (evento.id === info.event.id) {
        return {
          ...evento,
          start: info.event.start,
          end: info.event.end,
        };
      }
      return evento;
    });

    setEventos(updatedEventos);

    // Guardar en localStorage o API
    localStorage.setItem("eventos", JSON.stringify(updatedEventos));

    // Notificar al usuario
    mostrarAlerta({
      icon: "success",
      title: "Servicio actualizado",
      text: `La duración del servicio ha sido actualizada.`,
      timer: 2000,
      timerProgressBar: true,
      background: "#f8ffec",
      color: "#004122",
    });
  };

  // Manejar cuando se arrastra un servicio desde fuera del calendario
  const handleExternalDrop = (info) => {
    // Crear un nuevo evento a partir del elemento arrastrado
    const servicioData = JSON.parse(
      info.draggedEl.getAttribute("data-servicio")
    );

    const newEvento = {
      id: `evento-${Date.now()}`,
      title: servicioData.titulo,
      start: info.date,
      end: new Date(info.date.getTime() + 60 * 60 * 1000),
      backgroundColor: getColorByEstado(servicioData.estado),
      borderColor: getColorByEstado(servicioData.estado),
      textColor: "white",
      className: `estado-${servicioData.estado}`, // Usar className en lugar de classNames
      extendedProps: {
        estado: servicioData.estado,
        description: servicioData.descripcion,
        clienteId: servicioData.clienteId,
        resourceId: info.resource?.id || null,
      },
    };

    // Agregar el nuevo evento a tu estado
    const updatedEventos = [...eventos, newEvento];
    setEventos(updatedEventos);

    // Guardar en localStorage o API
    localStorage.setItem("eventos", JSON.stringify(updatedEventos));

    // Notificar al usuario
    mostrarAlerta({
      icon: "success",
      title: "Servicio asignado",
      text: `El servicio ha sido asignado al calendario.`,
      timer: 2000,
      timerProgressBar: true,
    });

    // Opcional: remover el servicio de los pendientes si corresponde
    if (info.draggedEl.classList.contains("servicio-card")) {
      const serviciosActualizados = serviciosPendientes.filter(
        (s) => s.id !== servicioData.id
      );
      setServiciosPendientes(serviciosActualizados);
      localStorage.setItem(
        "serviciosPendientes",
        JSON.stringify(serviciosActualizados)
      );
    }
  };

  const handleServicioClick = (servicio) => {
    Swal.fire({
      title: servicio.title,
      html: `
      <div class="text-left">
        <p>
          <strong><i class="fas fa-info-circle" style="color: #87c947; margin-right: 1rem;"></i>Descripción:</strong><br>
          ${servicio.descripcion || "Sin descripción"}
        </p>
      </div>
      <div class="action-buttons">
        <button type="button" id="btnAsignar" class="asignar-btn">
          <i class="fas fa-calendar-plus"></i> Asignar al Calendario
        </button>
        <button type="button" id="btnEliminar" class="eliminar-btn">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
    `,
      showConfirmButton: false,
      showCancelButton: false,
      customClass: {
        popup: "servicio-modal",
      },
      didOpen: () => {
        // Añadir manejadores de eventos a los botones
        document.getElementById("btnAsignar").addEventListener("click", () => {
          Swal.close();
          handleAsignarServicio(servicio);
        });

        document.getElementById("btnEliminar").addEventListener("click", () => {
          Swal.close();
          handleEliminarServicio(servicio.id);
        });
      },
    });
  };

  // Mejorar la función getColorByEstado para ser más explícita
  const getColorByEstado = (estado) => {
    const colores = {
      confirmado: "#87c947",
      cancelado: "#e74c3c",
      pendiente: "#ffd54f",
      almuerzo: "#3498db",
      especial: "#9b59b6",
    };

    return colores[estado] || "#87c947";
  };

  const mostrarDetallesServicio = (servicio) => {
    mostrarAlerta({
      title: servicio.title,
      html: `
      <div class="detalles-content">
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-user"></i>Técnico
          </div>
          <div class="detalle-value">${servicio.resourceId}</div>
        </div>
        
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-clock"></i>Horario
          </div>
          <div class="detalle-value">
            <div>Inicio: ${servicio.start}</div>
            <div>Fin: ${servicio.end}</div>
          </div>
        </div>
        
        <div class="detalle-row">
          <div class="detalle-label">
            <i class="fas fa-align-left"></i>Descripción
          </div>
          <div class="detalle-value">
            ${servicio.description || "Sin descripción"}
          </div>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i>Editar',
      cancelButtonText: '<i class="fas fa-trash"></i>Eliminar',
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#fff",
      customClass: {
        popup: "detalles-servicio",
        actions: "detalles-actions",
        confirmButton: "detalles-confirm",
        cancelButton: "detalles-cancel",
      },
    });
  };

  const cargarTecnicos = () => {
    const tecnicosGuardados =
      JSON.parse(localStorage.getItem("tecnicos")) || tecnicosIniciales;
    setTecnicos(tecnicosGuardados);
  };

  return (
    <div className="calendar-container">
      <Sidebar
        serviciosPendientes={serviciosPendientes}
        onAgregarServicio={handleAgregarServicio}
        onEliminarServicio={handleEliminarServicio}
        onAsignarServicio={handleAsignarServicio}
      />
      <div className="main-content">
        <CalendarHeader onAgregarTecnico={handleAgregarTecnico} />
        <div id="calendario">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              resourceTimeGridPlugin,
              multiMonthPlugin,
            ]}
            initialView="resourceTimeGridDay"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "resourceTimeGridDay,dayGridMonth,multiMonthYear",
            }}
            views={{
              resourceTimeGridDay: {
                type: "resourceTimeGrid",
                duration: { days: 1 },
                buttonText: "Día",
                slotDuration: "00:30:00",
                slotMinTime: "00:00:00",
                slotMaxTime: "24:00:00",
                editable: true,
                allDaySlot: false,
              },
              dayGridMonth: {
                type: "dayGrid",
                buttonText: "Mes",
                editable: false,
                dayMaxEvents: 3,
                moreLinkContent: (args) => {
                  return `+${args.num} más`;
                },
                eventTimeFormat: {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                eventDisplay: "block",
                displayEventEnd: false,
                eventContent: (arg) => {
                  return {
                    html: `
                    <div class="fc-event-main-frame" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      <div class="fc-event-time" style="display: inline;">${arg.timeText}</div>
                      <div class="fc-event-title" style="display: inline; margin-left: 4px;">${arg.event.title}</div>
                    </div>
                  `,
                  };
                },
              },
              multiMonthYear: {
                type: "multiMonth",
                buttonText: "Año",
                multiMonthMaxColumns: 1,
                multiMonthMinWidth: 300,
                editable: false,
                dayMaxEvents: 2,
                multiMonthTitleFormat: { year: "numeric", month: "long" },
                eventMaxStack: 2,
                moreLinkContent: (args) => {
                  return `+${args.num} más`;
                },
                eventContent: (arg) => {
                  return {
                    html: `
                    <div class="fc-event-main-frame year-view-event">
                        <div class="fc-event-title">${arg.event.title}</div>
                    </div>
                    `,
                  };
                },
              },
            }}
            resources={tecnicos}
            events={validateEvents(eventos)}
            editable={true}
            eventStartEditable={true}
            eventDurationEditable={true}
            droppable={true}
            eventOverlap={true}
            eventConstraint={null}
            businessHours={false}
            snapDuration={"00:15:00"}
            slotDuration={"00:30:00"}
            slotLabelInterval={"01:00:00"}
            allDaySlot={false}
            eventResize={handleEventResize}
            eventDrop={handleEventDrop}
            drop={handleExternalDrop}
            resourceOrder="order"
            resourceAreaWidth="15%"
            resourceLabelContent={resourceLabelContent}
            eventResourceEditable={true}
            locale={esLocale}
            selectable={true}
            select={(info) => {
              if (info.view.type === "resourceTimeGridDay") {
                handleDateSelect(info);
              }
            }}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDidMount={handleEventDidMount}
            resourceAreaHeaderContent="Técnicos"
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
