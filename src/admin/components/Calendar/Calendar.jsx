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
import "./styles/service-card-override.css"; // Asegurar que estos estilos se apliquen al final
import "./styles/add-technician-form.css"; // Estilos específicos para el formulario de agregar técnico
import "./styles/edit-technician-form.css"; // Estilos específicos para el formulario de editar técnico
import "./styles/dark-mode-form-fields.css"; // Estilos para campos de formulario en modo oscuro

const Calendar = ({ darkMode = false }) => {
  const { services, loading, error, updateService, getAllServices } =
    useServices();
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [localServices, setLocalServices] = useState([]); // Agregar estado para servicios locales
  const { mostrarAlerta } = useAlertas();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ x: 0, y: 0 });
  const [mostrarMenuContextual, setMostrarMenuContextual] = useState(false);
  const [mostrarMenuContextualTecnico, setMostrarMenuContextualTecnico] =
    useState(false); // Efecto para la carga inicial
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        console.log("Fetching technicians...");
        const techniciansData = await userService.getTechnicians();
        console.log("Technicians data:", techniciansData);
        const formattedTechnicians = techniciansData.map((tech, index) => ({
          id: tech._id,
          _id: tech._id,
          title: tech.name,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          order: index + 1,
        }));
        setTecnicos(formattedTechnicians);
      } catch (error) {
        console.error("Error loading technicians:", error);
        setTecnicos([]);
      }
    };

    fetchTechnicians();
  }, []); // Solo cargar técnicos una vez al montar
  // Function to process services data
  const processServices = useCallback((servicesData) => {
    console.log("Processing services data:", servicesData);
    // Actualizar servicios locales
    setLocalServices(servicesData);

    // Procesar servicios pendientes
    const pendingServices = servicesData
      .filter((service) => service.status === "pending")
      .map((service) => ({
        _id: service._id,
        id: service._id,
        nombre: service.serviceType,
        descripcion: service.description || "",
        duracion: service.duration || 60,
        color: "#ffd54f",
        estado: service.status || "pendiente",
        clientName: service.name,
        clientEmail: service.email,
        clientPhone: service.phone,
        address: service.address,
        preferredDate: service.preferredDate,
        updatedAt: service.updatedAt,
        createdAt: service.createdAt,
      }));

    console.log("Pending services:", pendingServices);
    setServiciosPendientes(pendingServices);

    // Actualizar eventos del calendario
    const calendarEvents = servicesData
      .filter((service) => {
        // Include confirmed services that have technician assigned
        if (service.status === "confirmed" && service.technician) {
          return true;
        }
        // Include pending services that need to be displayed on the calendar
        if (service.status === "pending") {
          return true;
        }
        // Include completed services
        if (service.status === "completed") {
          return true;
        }
        return false;
      })
      .map((service) => {
        // Create a properly formatted calendar event
        const event = {
          id: service._id,
          title: service.serviceType,
          // Use scheduledStart/End for confirmed services, preferredDate for pending
          start: service.scheduledStart || service.preferredDate,
          end:
            service.scheduledEnd ||
            new Date(
              new Date(service.preferredDate).getTime() + 60 * 60 * 1000
            ).toISOString(),
          // Set resourceId only for confirmed services
          ...(service.technician && { resourceId: service.technician }),
          backgroundColor:
            service.status === "confirmed" ? "#87c947" : "#ffd54f",
          borderColor: service.status === "confirmed" ? "#87c947" : "#ffd54f",
          extendedProps: {
            estado: service.status === "confirmed" ? "confirmado" : "pendiente",
            status: service.status,
            descripcion: service.description,
            description: service.description,
            cliente: service.name,
            clientName: service.name,
            telefono: service.phone,
            clientPhone: service.phone,
            email: service.email,
            clientEmail: service.email,
            direccion: service.address,
            address: service.address,
          },
        };
        console.log("Created calendar event:", event);
        return event;
      });

    console.log("Calendar events:", calendarEvents);
    setEventos(calendarEvents);
  }, []);

  // Efecto para procesar servicios cuando cambian
  useEffect(() => {
    console.log("Processing services effect...", {
      loading,
      servicesAvailable: Boolean(services),
      servicesLength: services?.length,
    });

    if (loading) {
      console.log("Still loading services...");
      return;
    }

    // Check for cached services if none are available
    if (!services || !Array.isArray(services) || services.length === 0) {
      console.log("No valid services array, checking cache...");
      const cachedServices = localStorage.getItem("cachedServices");

      if (cachedServices) {
        try {
          const parsedServices = JSON.parse(cachedServices);
          console.log("Found cached services:", parsedServices);

          if (Array.isArray(parsedServices) && parsedServices.length > 0) {
            console.log("Using cached services for calendar");
            processServices(parsedServices);
            return;
          }
        } catch (parseError) {
          console.error("Error parsing cached services:", parseError);
        }
      }

      setServiciosPendientes([]);
      setEventos([]);
      setLocalServices([]); // Limpiar servicios locales
      return;
    }

    console.log("Processing services:", services);

    // Process services data
    processServices(services);
  }, [services, loading, processServices]);

  const handleAgregarTecnico = async () => {
    // Verificar si estamos en modo oscuro
    const isDarkMode = document.body.classList.contains("dark-theme");

    const { value: formValues } = await mostrarAlerta({
      title: "Agregar Técnico",
      html: `        <style>
          .form-group {
            margin-bottom: 1.5rem;
            position: relative;
          }
          #tecnicoForm .form-control {
            padding: 0.75rem 1rem;
            border: 2px solid #87c947 !important;
            border-radius: 8px !important;
            background-color: ${isDarkMode ? "#2c2e35" : "#ffffff"} !important;
            color: ${isDarkMode ? "#ffffff" : "#004122"} !important;
            font-size: 1rem;
            width: 100%;
            margin-top: 0.25rem;
            box-shadow: none !important;
          }
          #tecnicoForm .form-control:focus {
            border-color: #87c947 !important;
            box-shadow: 0 0 0 0.2rem rgba(135, 201, 71, 0.25) !important;
            outline: none;
          }
          #tecnicoForm .form-control::placeholder {
            color: ${isDarkMode ? "#aaa" : "#a0a0a0"};
            opacity: ${isDarkMode ? "0.7" : "0.8"};
          }
          #tecnicoForm .form-label {
            font-weight: 600 !important;
            color: #87c947 !important;
            display: block !important;
            font-size: 1rem !important;
            margin-bottom: 0.5rem !important;
            opacity: 1 !important;
            position: relative !important;
            transform: none !important;
            pointer-events: auto !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
            padding: 0 !important;
          }
          .input-with-icon {
            position: relative;
            margin-top: 0.5rem;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
          }
          .input-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #87c947 !important;
            font-size: 1.1rem;
          }
          .swal2-html-container {
            margin: 1rem 0 !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
          }
          .swal2-popup {
            padding: 1.5rem !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
          }
          #tecnicoForm {
            text-align: left !important;
            background-color: ${isDarkMode ? "#1a1c22" : "#ffffff"} !important;
            color: ${isDarkMode ? "#ffffff" : "#004122"} !important;
          }
          #tecnicoForm .form-label {
            transition: none !important;
          }
          #tecnicoForm .form-control:focus + .form-label,
          #tecnicoForm .form-control:not(:placeholder-shown) + .form-label {
            transform: none !important;
            font-size: 1rem !important;
            color: #87c947 !important;
          }
        </style>
        <form id="tecnicoForm" class="text-left dark-mode-form-fields">
          <div class="form-group">
            <label class="form-label">Nombre del técnico</label>
            <div class="input-with-icon">
              <input 
                type="text" 
                id="nombreTecnico" 
                placeholder="Ingrese el nombre completo" 
                class="form-control" 
                required
              >
              <i class="fas fa-user input-icon"></i>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <div class="input-with-icon">
              <input 
                type="email" 
                id="emailTecnico" 
                placeholder="correo@ejemplo.com" 
                class="form-control" 
                required
              >
              <i class="fas fa-envelope input-icon"></i>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <div class="input-with-icon">
              <input 
                type="tel" 
                id="telefonoTecnico" 
                placeholder="Número de contacto" 
                class="form-control" 
                required
              >
              <i class="fas fa-phone input-icon"></i>
            </div>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#87c947",
      cancelButtonColor: isDarkMode ? "#444" : "#e74c3c",
      background: isDarkMode ? "#1a1c22" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#004122",
      customClass: {
        confirmButton: "btn-confirm",
        cancelButton: "btn-cancel",
        popup: isDarkMode ? "dark-theme" : "",
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombreTecnico").value;
        const email = document.getElementById("emailTecnico").value;
        const telefono = document.getElementById("telefonoTecnico").value;

        if (!nombre || !email || !telefono) {
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

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un correo electrónico válido",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        return {
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
        };
      },
    });
    if (formValues) {
      try {
        // Crear el técnico en la base de datos
        const nuevoTecnicoDB = await userService.createTechnician({
          name: formValues.nombre,
          email: formValues.email,
          phone: formValues.telefono,
          role: "technician",
        });

        // Actualizar el estado local con el nuevo técnico
        const tecnicosActuales = tecnicos;
        const minOrder = Math.min(...tecnicosActuales.map((t) => t.order || 0));

        const nuevoTecnico = {
          id: nuevoTecnicoDB._id,
          title: nuevoTecnicoDB.name,
          email: nuevoTecnicoDB.email,
          phone: nuevoTecnicoDB.phone,

          order: minOrder - 1,
        };

        // Agregar el nuevo técnico al array y actualizar estado
        setTecnicos([...tecnicosActuales, nuevoTecnico]);

        mostrarAlerta({
          icon: "success",
          title: "Técnico Agregado",
          text: "El técnico ha sido agregado correctamente",
          timer: 1500,
          showConfirmButton: false,
          background: "#f8ffec",
          color: "#004122",
        });
      } catch (error) {
        console.error("Error al crear técnico:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text:
            error.message ||
            "Hubo un problema al crear el técnico. Por favor intente de nuevo.",
          confirmButtonColor: "#87c947",
          background: "#f8ffec",
          color: "#004122",
        });
      }
    }
  };
  const handleAgregarServicio = async (nuevoServicio) => {
    try {
      // Asegurarnos de que todos los campos necesarios estén presentes
      const currentDate = new Date().toISOString();
      // Asegurarse de que todos los campos obligatorios estén presentes
      const serviceData = {
        name: nuevoServicio.clientName,
        email: nuevoServicio.clientEmail,
        phone: nuevoServicio.clientPhone,
        address: nuevoServicio.address || "No especificada",
        serviceType: nuevoServicio.serviceType || "other", // Usar serviceType directamente
        description: nuevoServicio.descripcion || "",
        preferredDate: nuevoServicio.preferredDate || currentDate,
        // Asegurarse de que document siempre tenga un valor válido
        document: nuevoServicio.document || "1234567890",
        status: "pending",
      };

      console.log("Creando nuevo servicio con datos:", serviceData);

      // Create service in database
      const createdService = await serviceService.saveService(serviceData);
      console.log("Servicio creado:", createdService);

      // Map MongoDB document to local service format with all fields populated
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
        preferredDate: createdService.preferredDate || currentDate,
        _id: createdService._id,
      };

      // Add to local state
      const serviciosActualizados = [...serviciosPendientes, localService];
      setServiciosPendientes(serviciosActualizados);

      // También actualizamos los servicios para que se refleje inmediatamente
      setLocalServices((prev) => [...prev, createdService]);

      // Forzar refresco del listado de servicios
      await getAllServices(true);

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
      if (!servicioId) {
        throw new Error("ID de servicio no proporcionado");
      }

      console.log("Intentando eliminar servicio con ID:", servicioId);

      const confirmResult = await mostrarAlerta({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar este servicio? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      await serviceService.deleteService(servicioId);

      // Actualizar los servicios pendientes
      setServiciosPendientes((prev) =>
        prev.filter((service) => service._id !== servicioId)
      );

      // Actualizar los eventos
      setEventos((prev) =>
        prev.filter((event) => event.serviceId !== servicioId)
      );

      // Actualizar servicios locales
      setLocalServices((prev) =>
        prev.filter((service) => service._id !== servicioId)
      );

      // Recargar todos los servicios para asegurar sincronización
      await getAllServices(true);

      mostrarAlerta({
        title: "¡Eliminado!",
        text: "El servicio ha sido eliminado correctamente.",
        icon: "success",
      });
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      mostrarAlerta({
        title: "Error",
        text: error.message || "No se pudo eliminar el servicio",
        icon: "error",
      });
    }
  };
  const handleEventDrop = async (info) => {
    console.log("handleEventDrop triggered:", info);
    const { event } = info;
    const tecnicoDestino = tecnicos.find(
      (t) => t.id === event.getResources()[0]?.id
    );

    // Check if the event represents a service
    const serviceId = event.id
      ? event.id.startsWith("evento-")
        ? event.extendedProps.serviceId || event.id.split("-")[1]
        : event.id
      : event.extendedProps
      ? event.extendedProps.serviceId
      : null;

    if (!serviceId || !tecnicoDestino) {
      console.error("No valid service ID or technician found", {
        event,
        tecnicoDestino,
      });
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
      try {
        const eventId = event.id;
        console.log("Moving service:", {
          id: eventId,
          technician: tecnicoDestino.id,
          start: event.startStr,
          end: event.endStr,
        });

        // Get the existing service data from the event's extendedProps
        const serviceData = event.extendedProps;
        console.log("Service data from event:", serviceData);

        // Remove 'evento-' prefix if present and validate if it's a MongoDB ID
        const cleanId = eventId.startsWith("evento-")
          ? eventId.split("-")[1]
          : eventId;

        const updateData = {
          technician: tecnicoDestino.id,
          scheduledStart: event.startStr,
          scheduledEnd: event.endStr,
          status: "confirmed",
          // Include additional service data if this is a new service
          ...(serviceData && {
            name: serviceData.clientName,
            email: serviceData.clientEmail,
            phone: serviceData.clientPhone,
            document: serviceData.document,
            address: serviceData.address,
            serviceType: serviceData.serviceType || serviceData.nombre,
            description: serviceData.descripcion,
          }),
        };

        console.log("Updating service with data:", updateData);
        const updatedService = await serviceService.updateService(
          cleanId,
          updateData
        );
        console.log("Service updated successfully:", updatedService);

        // If this was a new service that just got saved, update the event ID
        if (updatedService._id && updatedService._id !== cleanId) {
          const newEventId = `evento-${updatedService._id}`;
          event.setProp("id", newEventId);
        }

        // Update local state
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
      } catch (error) {
        console.error("Error al asignar técnico al servicio:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo asignar el técnico al servicio. Por favor, intente nuevamente.",
        });
        info.revert();
      }
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
      // Verificar qué ID tenemos disponible
      console.log("Datos del técnico recibidos:", tecnico);
      const tecnicoId = tecnico._id || tecnico.id;
      console.log("ID que se usará:", tecnicoId);

      // Buscar primero en el estado local
      let tecnicoActual = tecnicos.find(
        (t) => t.id === tecnicoId || t._id === tecnicoId
      );
      console.log("Datos encontrados en estado local:", tecnicoActual);

      if (!tecnicoActual) {
        // Si no está en el estado, buscar en localStorage
        const tecnicosGuardados =
          JSON.parse(localStorage.getItem("tecnicos")) || [];
        tecnicoActual = tecnicosGuardados.find(
          (t) => t.id === tecnicoId || t._id === tecnicoId
        );
        console.log("Datos encontrados en localStorage:", tecnicoActual);
      }

      // Intentar obtener datos actualizados del servidor como respaldo
      try {
        const tecnicoServidor = await userService.getTechnicianById(tecnicoId);
        console.log("Datos del servidor:", tecnicoServidor);
        if (tecnicoServidor) {
          tecnicoActual = {
            ...tecnicoActual,
            ...tecnicoServidor,
            id: tecnicoId,
            _id: tecnicoId,
          };
        }
      } catch (error) {
        console.log(
          "No se pudieron obtener datos actualizados del servidor:",
          error
        );
      }

      // Si no tenemos datos completos, usar los datos básicos que tenemos
      if (!tecnicoActual) {
        tecnicoActual = {
          id: tecnicoId,
          _id: tecnicoId,
          name: tecnico.name || tecnico.title,
          email: tecnico.email || "",
          phone: tecnico.phone || "",
          title: tecnico.title || tecnico.name,
        };
      }

      console.log(
        "Datos finales del técnico para el formulario:",
        tecnicoActual
      );

      // Verificar si estamos en modo oscuro
      const isDarkMode = document.body.classList.contains("dark-theme");

      const { value: formValues } = await mostrarAlerta({
        title: "Editar Técnico",
        html: `
          <style>
            .form-group {
              margin-bottom: 1.5rem;
              position: relative;
            }
            #editTecnicoForm .form-control {
              padding: 0.75rem 1rem;
              border: 2px solid #87c947 !important;
              border-radius: 8px !important;
              background-color: ${
                isDarkMode ? "#2c2e35" : "#ffffff"
              } !important;
              color: ${isDarkMode ? "#ffffff" : "#004122"} !important;
              font-size: 1rem;
              width: 100%;
              margin-top: 0.25rem;
              box-shadow: none !important;
            }
            #editTecnicoForm .form-control:focus {
              border-color: #87c947 !important;
              box-shadow: 0 0 0 0.2rem rgba(135, 201, 71, 0.25) !important;
              outline: none;
            }
            #editTecnicoForm .form-control::placeholder {
              color: ${isDarkMode ? "#aaa" : "#a0a0a0"};
              opacity: ${isDarkMode ? "0.7" : "0.8"};
            }
            #editTecnicoForm            .form-label {
              font-weight: 600 !important;
              color: #87c947 !important;
              display: block !important;
              font-size: 1rem !important;
              margin-bottom: 0.5rem !important;
              background-color: ${
                isDarkMode ? "#1a1c22" : "#ffffff"
              } !important;
              padding: 0 !important;
            }
            .input-with-icon {
              position: relative;
              background-color: ${
                isDarkMode ? "#1a1c22" : "#ffffff"
              } !important;
            }
            .input-icon {
              position: absolute;
              right: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #87c947 !important;
            }
            #editTecnicoForm {
              text-align: left !important;
              background-color: ${
                isDarkMode ? "#1a1c22" : "#ffffff"
              } !important;
              color: ${isDarkMode ? "#ffffff" : "#004122"} !important;
            }
          </style>
          <form id="editTecnicoForm" class="text-left dark-mode-form-fields">
            <div class="form-group">
              <label class="form-label">Nombre del Técnico</label>
              <div class="input-with-icon">                <input 
                  type="text" 
                  id="nombreTecnico" 
                  class="form-control" 
                  value="${tecnicoActual.name || tecnicoActual.title || ""}"
                  placeholder="Nombre completo"
                  required
                >
                <i class="fas fa-user input-icon"></i>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <div class="input-with-icon">
                <input 
                  type="email" 
                  id="emailTecnico" 
                  class="form-control" 
                  value="${tecnicoActual.email || ""}"
                  placeholder="correo@ejemplo.com"
                  required
                >
                <i class="fas fa-envelope input-icon"></i>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <div class="input-with-icon">
                <input 
                  type="tel" 
                  id="telefonoTecnico" 
                  class="form-control" 
                  value="${tecnicoActual.phone || ""}"
                  placeholder="Número de contacto"
                  required
                >
                <i class="fas fa-phone input-icon"></i>
              </div>
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#87c947",
        cancelButtonColor: isDarkMode ? "#444" : "#e74c3c",
        background: isDarkMode ? "#1a1c22" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#004122",
        customClass: {
          popup: isDarkMode ? "dark-theme" : "",
        },
        preConfirm: () => {
          const nombre = document.getElementById("nombreTecnico").value;
          const email = document.getElementById("emailTecnico").value;
          const telefono = document.getElementById("telefonoTecnico").value;

          if (!nombre || !email || !telefono) {
            Swal.showValidationMessage("Por favor complete todos los campos");
            return false;
          }

          if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            Swal.showValidationMessage(
              "Por favor ingrese un correo electrónico válido"
            );
            return false;
          }

          return { nombre, email, telefono };
        },
      });
      if (formValues) {
        try {
          console.log("Enviando actualización para técnico:", {
            id: tecnicoActual.id || tecnicoActual._id,
            currentData: tecnicoActual,
            newData: formValues,
          });

          // Actualizar el técnico en la base de datos
          const tecnicoActualizado = await userService.updateTechnician(
            tecnicoActual.id || tecnicoActual._id,
            {
              name: formValues.nombre,
              email: formValues.email,
              phone: formValues.telefono,
            }
          );

          console.log("Respuesta de actualización:", tecnicoActualizado);

          if (!tecnicoActualizado) {
            throw new Error("No se recibieron datos actualizados del servidor");
          }

          // Actualizar el estado local con los datos actualizados
          const tecnicosActualizados = tecnicos.map((t) =>
            t.id === tecnicoActualizado.id || t.id === tecnicoActualizado._id
              ? {
                  ...t,
                  id: tecnicoActualizado.id || tecnicoActualizado._id,
                  _id: tecnicoActualizado._id || tecnicoActualizado.id,
                  title: tecnicoActualizado.name,
                  name: tecnicoActualizado.name,
                  email: tecnicoActualizado.email,
                  phone: tecnicoActualizado.phone,
                }
              : t
          );

          setTecnicos(tecnicosActualizados);
          localStorage.setItem(
            "tecnicos",
            JSON.stringify(tecnicosActualizados)
          );

          mostrarAlerta({
            icon: "success",
            title: "Técnico actualizado exitosamente",
            text: "Los datos del técnico han sido actualizados",
            confirmButtonColor: "#87c947",
            timer: 1500,
            showConfirmButton: false,
            background: "#f8ffec",
            color: "#004122",
          });
        } catch (error) {
          console.error("Error al actualizar técnico:", error);
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al actualizar el técnico. Por favor intente de nuevo.",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
        }
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
        html: `
          <div class="text-left">
            <p style="color: #004122; margin-bottom: 1rem;">
              ¿Deseas eliminar al técnico <strong>${tecnico.title}</strong>?
            </p>
            <div style="background-color: #fff3cd; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107;">
              <i class="fas fa-exclamation-triangle" style="color: #ffc107; margin-right: 0.5rem;"></i>
              Esta acción no se puede deshacer y eliminará todos los servicios asignados a este técnico.
            </div>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#87c947",
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
        background: "#ffffff",
        color: "#004122",
      });

      if (result.isConfirmed) {
        try {
          // Eliminar el técnico de la base de datos
          await userService.deleteTechnician(tecnico.id);

          // Eliminar el técnico del estado local
          const tecnicosActualizados = tecnicos.filter(
            (t) => t.id !== tecnico.id
          );
          setTecnicos(tecnicosActualizados);
          localStorage.setItem(
            "tecnicos",
            JSON.stringify(tecnicosActualizados)
          );

          // También necesitamos eliminar los eventos asociados a este técnico
          const eventosActualizados = eventos.filter(
            (evento) => evento.resourceId !== tecnico.id
          );
          setEventos(eventosActualizados);
          localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

          mostrarAlerta({
            icon: "success",
            title: "Técnico eliminado exitosamente",
            text: "El técnico y sus servicios asignados han sido eliminados",
            confirmButtonColor: "#87c947",
            timer: 1500,
            showConfirmButton: false,
            background: "#f8ffec",
            color: "#004122",
          });
        } catch (error) {
          console.error("Error al eliminar técnico:", error);
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el técnico. Por favor intente de nuevo.",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar la solicitud",
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

      console.log("Event created:", nuevoEvento);
      console.log("Technicians state:", tecnicos);

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
      // Ensure we're using the MongoDB ID
      const realServiceId =
        typeof servicioId === "string" && servicioId.startsWith("evento-")
          ? servicioId.split("-")[1]
          : servicioId;

      if (!realServiceId) {
        console.error("No valid service ID found", {
          eventoCalendario,
          servicioId,
        });
        throw new Error("Invalid service ID");
      }

      console.log("Assigning service to calendar event:", {
        serviceId: realServiceId,
        technician: eventoCalendario.resourceId,
        start: eventoCalendario.start,
        end: eventoCalendario.end,
      });

      // First convert the service request to a service if needed
      // This will create a new service record in the services collection
      let updatedService;
      try {
        console.log("Converting service request to service...");
        const conversionResult =
          await serviceService.convertServiceRequestToService(
            realServiceId,
            eventoCalendario.resourceId
          );

        updatedService = conversionResult.service;
        console.log("Service request converted to service:", updatedService);
      } catch (conversionError) {
        console.log(
          "Not a service request or conversion failed. Falling back to regular update:",
          conversionError
        );

        // If conversion fails, fall back to the regular update
        updatedService = await serviceService.updateService(realServiceId, {
          status: "confirmed",
          technician: eventoCalendario.resourceId,
          scheduledStart: eventoCalendario.start,
          scheduledEnd: eventoCalendario.end,
        });
      }

      console.log("Service successfully updated:", updatedService);

      // Create a properly formatted calendar event with required properties
      const formattedEvent = {
        id: updatedService._id,
        title: updatedService.serviceType,
        start: updatedService.scheduledStart || updatedService.preferredDate,
        end:
          updatedService.scheduledEnd ||
          new Date(
            new Date(updatedService.preferredDate).getTime() + 60 * 60 * 1000
          ).toISOString(),
        resourceId: updatedService.technician,
        backgroundColor: "#87c947",
        borderColor: "#87c947",
        extendedProps: {
          estado: "confirmado",
          status: "confirmed",
          descripcion: updatedService.description,
          description: updatedService.description,
          cliente: updatedService.name,
          clientName: updatedService.name,
          telefono: updatedService.phone,
          clientPhone: updatedService.phone,
          email: updatedService.email,
          clientEmail: updatedService.email,
          direccion: updatedService.address,
          address: updatedService.address,
        },
      };

      console.log("Formatted event for calendar:", formattedEvent);

      // Update UI state with the properly formatted event
      setEventos((prevEventos) => {
        // Remove any existing event with the same ID to avoid duplicates
        const filteredEvents = prevEventos.filter(
          (e) => e.id !== formattedEvent.id
        );
        return [...filteredEvents, formattedEvent];
      });

      setServiciosPendientes((prevServicios) =>
        prevServicios.filter(
          (s) => s.id !== servicioId && s._id !== realServiceId
        )
      );

      // Save events to localStorage with properly formatted event
      const eventosActualizados = eventos.filter(
        (e) => e.id !== formattedEvent.id
      );
      eventosActualizados.push(formattedEvent);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      // Update cached services to ensure persistence between page reloads
      const cachedServices = localStorage.getItem("cachedServices");
      if (cachedServices) {
        try {
          const parsedServices = JSON.parse(cachedServices);
          const updatedCache = parsedServices.map((service) =>
            service._id === realServiceId ? updatedService : service
          );
          localStorage.setItem("cachedServices", JSON.stringify(updatedCache));
          console.log("Cache updated after service assignment");
        } catch (cacheError) {
          console.error("Error updating service cache:", cacheError);
        }
      }

      // Force a refresh of service data in the background
      getAllServices(true);

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
    console.log("Validating events:", rawEvents);
    if (!Array.isArray(rawEvents)) {
      console.warn("Expected events array, got:", typeof rawEvents);
      return [];
    }

    return rawEvents.filter((event) => {
      if (!event) {
        console.warn("Found null or undefined event");
        return false;
      }

      // Check for required properties
      const hasTitle = event.title && typeof event.title === "string";
      const hasStart =
        event.start &&
        (event.start instanceof Date || typeof event.start === "string");

      // If missing required properties, log for debugging
      if (!hasTitle || !hasStart) {
        console.warn("Invalid event skipped:", {
          id: event.id,
          hasTitle,
          hasStart,
          event,
        });
        return false;
      }

      // For events with resourceId (assigned to technicians), make sure it exists
      if (event.resourceId && typeof event.resourceId !== "string") {
        console.warn("Invalid resourceId for event:", event);
        return false;
      }

      return true;
    });
  };

  // Manejador de eventos montados
  const handleEventDidMount = (info) => {
    try {
      console.log("Event mounted:", {
        id: info.event.id,
        title: info.event.title,
        resourceId: info.event.getResources().map((r) => r.id),
        start: info.event.start,
        extendedProps: info.event.extendedProps,
      });

      // Validar que el evento tenga las propiedades necesarias
      if (!info.event.display) {
        info.event.setDisplay("auto");
      }

      // Aplicar clase de estado si no está presente
      const estado =
        info.event.extendedProps?.estado ||
        (info.event.extendedProps?.status === "confirmed"
          ? "confirmado"
          : "pendiente");

      if (estado) {
        const claseEstado = `estado-${estado}`;
        if (!info.el.classList.contains(claseEstado)) {
          info.el.classList.add(claseEstado);
        }

        // Establecer el color de fondo basado en el estado si no se ha establecido
        if (!info.event.backgroundColor) {
          const color = getColorByEstado(estado);
          info.event.setProp("backgroundColor", color);
          info.event.setProp("borderColor", color);
          info.event.setProp("textColor", "white");
        }
      }

      // Add custom CSS classes for better visibility
      if (info.event.getResources().length > 0) {
        info.el.classList.add("assigned-event");
      }

      // Fix for making sure technician events are visible
      if (
        info.event.getResources().length > 0 &&
        !info.el.classList.contains("fc-event-assigned")
      ) {
        info.el.classList.add("fc-event-assigned");
      }
    } catch (error) {
      console.error("Error al montar evento:", error);
      console.log("Evento problemático:", info.event);
    }
  };

  // Debug function to monitor calendar events
  useEffect(() => {
    console.log("Calendar events updated:", eventos);

    // Check for events with technicians assigned
    const assignedEvents = eventos.filter((event) => event.resourceId);
    console.log("Events assigned to technicians:", assignedEvents);

    // Check for any potential issues with events
    const issueEvents = eventos.filter(
      (event) =>
        !event.title ||
        !event.start ||
        (event.resourceId && typeof event.resourceId !== "string")
    );

    if (issueEvents.length > 0) {
      console.warn("Found events with potential issues:", issueEvents);
    }
  }, [eventos]);

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
        ...servicioData.extendedProps,
        serviceId: servicioData._id, // Store the real MongoDB ID
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

  useEffect(() => {
    // Agregar estilos del menú contextual
    const style = document.createElement("style");
    style.textContent = `
      .context-menu {
        position: fixed;
        background: white;
        border-radius: 8px;
        padding: 8px 0;
        min-width: 150px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        border: 1px solid #e0e0e0;
      }
      .context-menu-item {
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #004122;
        transition: all 0.2s ease;
      }
      .context-menu-item:hover {
        background-color: #f8ffec;
      }
      .context-menu-item i {
        color: #87c947;
        width: 16px;
      }
      .context-menu-item.delete {
        color: #e74c3c;
      }
      .context-menu-item.delete i {
        color: #e74c3c;
      }
      .context-menu-separator {
        height: 1px;
        background-color: #e0e0e0;
        margin: 4px 0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Aplicar la licencia cuando el componente se monte - enfoque más sencillo y seguro
  useEffect(() => {
    // Eliminar solo el mensaje de licencia específico
    const removeLicenseMessage = () => {
      const licenseMessages = document.querySelectorAll(".fc-license-message");
      if (licenseMessages.length > 0) {
        console.log(
          `Ocultando ${licenseMessages.length} mensaje(s) de licencia`
        );
        licenseMessages.forEach((msg) => {
          if (msg) {
            msg.style.display = "none";
          }
        });
      }
    };

    // Aplicar después de un breve retraso para asegurarnos de que el calendario se haya renderizado
    const timeoutId = setTimeout(removeLicenseMessage, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // No necesitamos el código anterior que trataba de modificar window.FC
  // ya que hemos establecido la licencia de varias otras maneras

  return (
    <div className={`calendar-container ${darkMode ? "dark-theme" : ""}`}>
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
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            licenseKey="GPL-My-Project-Is-Open-Source"
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
