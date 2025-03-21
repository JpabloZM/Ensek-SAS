import React, { useState, useEffect } from "react";
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
import "./Calendar.css";

const API_MOCK = {
  eventos: [
    {
      titulo: "Servicio de ejemplo",
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
  const tecnicosIniciales = [
    { id: "1", title: "Francisco Londoño" },
    { id: "2", title: "Oscar Morales" },
    { id: "3", title: "Yeyferson Villada" },
    { id: "4", title: "Santiago Henao" },
    { id: "5", title: "German Oyola" },
    { id: "6", title: "Jhoan Moreno" },
  ];

  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [tecnicos, setTecnicos] = useState(tecnicosIniciales);
  const { mostrarAlerta } = useAlertas();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ x: 0, y: 0 });
  const [mostrarMenuContextual, setMostrarMenuContextual] = useState(false);
  const [mostrarMenuContextualTecnico, setMostrarMenuContextualTecnico] =
    useState(false);

  useEffect(() => {
    // Cargar servicios pendientes del localStorage
    const serviciosGuardados =
      JSON.parse(localStorage.getItem("serviciosPendientes")) || [];
    setServiciosPendientes(serviciosGuardados);

    // Cargar eventos del localStorage
    const eventosGuardados = JSON.parse(localStorage.getItem("eventos")) || [];
    setEventos(eventosGuardados);

    // Forzar la carga de técnicos iniciales
    setTecnicos(tecnicosIniciales);
    localStorage.setItem("tecnicos", JSON.stringify(tecnicosIniciales));

    const fetchEvents = async () => {
      try {
        // Simular llamada a la API
        const data = API_MOCK.eventos;

        const formattedEvents = data.map((event) => ({
          title: event.titulo,
          start: new Date(event.fecha_inicio),
          end: new Date(event.fecha_fin),
          display: "auto",
          backgroundColor: event.color || "#87c947",
          borderColor: event.color || "#87c947",
          extendedProps: {
            estado: event.estado,
            description: event.descripcion,
          },
        }));

        setEventos(formattedEvents);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        const eventosLocales =
          JSON.parse(localStorage.getItem("eventos")) || [];
        setEventos(eventosLocales);
      }
    };

    fetchEvents();
  }, []);

  const handleAgregarTecnico = async () => {
    const { value: nombreTecnico } = await mostrarAlerta({
      title: "Agregar Técnico",
      html: `
        <form id="tecnicoForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Nombre del técnico</label>
            <input type="text" id="nombreTecnico" class="form-control" required style="border-color: #c5f198;">
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
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
      },
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
            customClass: {
              popup: "swal2-popup-custom",
              title: "swal2-title-custom",
              confirmButton: "swal2-confirm-custom",
            },
          });
          return false;
        }
        return nombre;
      },
    });

    if (nombreTecnico) {
      const tecnicosActuales =
        JSON.parse(localStorage.getItem("tecnicos")) || tecnicosIniciales;
      const maxId = Math.max(...tecnicosActuales.map((t) => parseInt(t.id)), 0);
      const nuevoTecnico = {
        id: (maxId + 1).toString(),
        title: nombreTecnico,
      };

      const tecnicosActualizados = [...tecnicosActuales, nuevoTecnico];
      setTecnicos(tecnicosActualizados);
      localStorage.setItem("tecnicos", JSON.stringify(tecnicosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Técnico Agregado",
        text: "El técnico ha sido agregado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
        customClass: {
          popup: "swal2-popup-custom",
          title: "swal2-title-custom",
        },
      });
    }
  };

  const handleAgregarServicio = (nuevoServicio) => {
    const serviciosActualizados = [...serviciosPendientes, nuevoServicio];
    setServiciosPendientes(serviciosActualizados);
    localStorage.setItem(
      "serviciosPendientes",
      JSON.stringify(serviciosActualizados)
    );
  };

  const handleEliminarServicio = (id) => {
    const serviciosActualizados = serviciosPendientes.filter(
      (servicio) => servicio.id !== id
    );
    setServiciosPendientes(serviciosActualizados);
    localStorage.setItem(
      "serviciosPendientes",
      JSON.stringify(serviciosActualizados)
    );
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
    const { value: nuevoNombre } = await mostrarAlerta({
      title: "Editar Técnico",
      html: `
        <form id="tecnicoForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Nombre del técnico</label>
            <input type="text" id="nombreTecnico" class="form-control" required style="border-color: #c5f198;" value="${tecnico.title}">
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
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
        htmlContainer: "swal2-html-container",
      },
    });

    if (nuevoNombre) {
      const tecnicosActualizados = tecnicos.map((t) =>
        t.id === tecnico.id ? { ...t, title: nuevoNombre } : t
      );
      setTecnicos(tecnicosActualizados);
      localStorage.setItem("tecnicos", JSON.stringify(tecnicosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Técnico Actualizado",
        text: "El nombre del técnico ha sido actualizado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };

  const handleEliminarTecnico = async (tecnico) => {
    const { isConfirmed } = await mostrarAlerta({
      title: "¿Eliminar Técnico?",
      text: `¿Está seguro que desea eliminar a ${tecnico.title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#87c947",
      background: "#ffffff",
      color: "#004122",
    });

    if (isConfirmed) {
      const tecnicosActualizados = tecnicos.filter((t) => t.id !== tecnico.id);
      setTecnicos(tecnicosActualizados);
      localStorage.setItem("tecnicos", JSON.stringify(tecnicosActualizados));

      // Eliminar eventos asociados al técnico
      const eventosActualizados = eventos.filter(
        (e) => e.resourceId !== tecnico.id
      );
      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Técnico Eliminado",
        text: "El técnico ha sido eliminado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };

  const handleResourceContextMenu = (info, event) => {
    event.preventDefault();
    const tecnico = tecnicos.find((t) => t.id === info.resource.id);

    // Eliminar menú contextual existente si hay uno
    const existingMenu = document.querySelector(".context-menu");
    if (existingMenu) {
      existingMenu.remove();
    }

    // Crear el nuevo menú contextual
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.innerHTML = `
      <button class="context-menu-item editar">
        <i class="fas fa-edit"></i>
        Editar
      </button>
      <div class="context-menu-separator"></div>
      <button class="context-menu-item eliminar">
        <i class="fas fa-trash-alt"></i>
        Eliminar
      </button>
    `;

    // Posicionar el menú
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.body.appendChild(menu);

    // Agregar event listeners
    const btnEditar = menu.querySelector(".context-menu-item.editar");
    const btnEliminar = menu.querySelector(".context-menu-item.eliminar");

    btnEditar.addEventListener("click", () => {
      menu.remove();
      handleEditarTecnico(tecnico);
    });

    btnEliminar.addEventListener("click", () => {
      menu.remove();
      handleEliminarTecnico(tecnico);
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  };

  // Agregar useEffect para manejar los event listeners
  useEffect(() => {
    const attachContextMenuListeners = () => {
      const resourceLabels = document.querySelectorAll(".resource-label");
      resourceLabels.forEach((label) => {
        // Remover listeners anteriores para evitar duplicados
        label.removeEventListener("contextmenu", handleContextMenu);
        // Agregar nuevo listener
        label.addEventListener("contextmenu", handleContextMenu);
      });
    };

    // Función para manejar el evento contextmenu
    const handleContextMenu = (e) => {
      e.preventDefault();
      const resourceId = e.target.getAttribute("data-resource-id");
      const tecnico = tecnicos.find((t) => t.id === resourceId);
      if (tecnico) {
        handleResourceContextMenu({ resource: tecnico }, e);
      }
    };

    // Agregar los listeners inicialmente
    attachContextMenuListeners();

    // Observer para detectar cambios en el DOM y reagregar los listeners
    const observer = new MutationObserver(() => {
      attachContextMenuListeners();
    });

    // Observar cambios en el calendario
    const calendario = document.getElementById("calendario");
    if (calendario) {
      observer.observe(calendario, {
        childList: true,
        subtree: true,
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      const resourceLabels = document.querySelectorAll(".resource-label");
      resourceLabels.forEach((label) => {
        label.removeEventListener("contextmenu", handleContextMenu);
      });
    };
  }, [tecnicos]); // Dependencia del useEffect

  // Modificar resourceLabelContent para incluir el ID del recurso
  const resourceLabelContent = (arg) => {
    return {
      html: `<div class="resource-label" style="cursor: context-menu;" data-resource-id="${arg.resource.id}">${arg.resource.title}</div>`,
    };
  };

  const handleDateSelect = async (selectInfo) => {
    const tecnico = tecnicos.find((t) => t.id === selectInfo.resource.id);
    const fechaInicio = new Date(selectInfo.start);
    const fechaFin = new Date(selectInfo.end);

    const estadosServicio = {
      confirmado: { nombre: "Confirmado", color: "#87c947", icon: "fa-check" },
      cancelado: { nombre: "Cancelado", color: "#e74c3c", icon: "fa-times" },
      pendiente: { nombre: "Pendiente", color: "#ffd54f", icon: "fa-clock" },
      almuerzo: {
        nombre: "Hora de Almuerzo",
        color: "#3498db",
        icon: "fa-utensils",
      },
      especial: {
        nombre: "Situación Especial",
        color: "#9b59b6",
        icon: "fa-exclamation-circle",
      },
    };

    const { value: formValues } = await mostrarAlerta({
      title: "Agregar Servicio",
      html: `
        <form id="servicioForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Nombre del servicio</label>
            <input type="text" id="nombreServicio" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Descripción</label>
            <textarea id="descripcionServicio" class="form-control" style="border-color: #c5f198;"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Estado del Servicio</label>
            <div id="estadosContainer">
              ${Object.entries(estadosServicio)
                .map(
                  ([key, estado]) => `
                  <button type="button" class="estado-btn" 
                    data-estado="${key}" 
                    style="background-color: ${estado.color}; color: white;">
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
            <small>Técnico: ${tecnico.title}</small><br>
            <small>Inicio: ${fechaInicio.toLocaleTimeString()}</small><br>
            <small>Fin: ${fechaFin.toLocaleTimeString()}</small>
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
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      calendarApi.addEvent({
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
        classNames: [`estado-${formValues.estado}`],
        display: "block",
      });
    }
  };

  const handleEventClick = (info) => {
    // Si estamos en vista mes o año, solo cambiamos a la vista día
    if (
      info.view.type === "dayGridMonth" ||
      info.view.type === "multiMonthYear"
    ) {
      info.view.calendar.changeView("resourceTimeGridDay", info.event.start);
      return;
    }

    const evento = info.event;
    const tecnico = tecnicos.find((t) => t.id === evento.getResources()[0]?.id);
    const fechaInicio = new Date(evento.start);
    const fechaFin = new Date(evento.end);

    Swal.fire({
      title: evento.title,
      html: `
        <div class="text-left mb-3">
          <p style="color: #004122; margin-bottom: 0.5rem;">
            <strong><i class="fas fa-user" style="color: #87c947;"></i> Técnico:</strong> 
            ${tecnico?.title}
          </p>
          <p style="color: #004122; margin-bottom: 0.5rem;">
            <strong><i class="fas fa-clock" style="color: #87c947;"></i> Horario:</strong><br>
            Inicio: ${fechaInicio.toLocaleTimeString()}<br>
            Fin: ${fechaFin.toLocaleTimeString()}
          </p>
          <p style="color: #004122;">
            <strong><i class="fas fa-info-circle" style="color: #87c947;"></i> Descripción:</strong><br>
            ${evento.extendedProps.descripcion || "Sin descripción"}
          </p>
        </div>
        <div class="d-flex flex-column gap-2">
          <button class="btn w-100" id="btnEditar" style="background-color: #87c947; color: white; border: none;">
            <i class="fas fa-edit me-2"></i>Editar
          </button>
          <button class="btn btn-danger w-100" id="btnEliminar">
            <i class="fas fa-trash-alt me-2"></i>Eliminar
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: false,
      background: "#ffffff",
      color: "#004122",
      didOpen: () => {
        const btnEditar = Swal.getPopup().querySelector("#btnEditar");
        const btnEliminar = Swal.getPopup().querySelector("#btnEliminar");

        btnEditar.addEventListener("mouseover", () => {
          btnEditar.style.backgroundColor = "#6fa33c";
        });
        btnEditar.addEventListener("mouseout", () => {
          btnEditar.style.backgroundColor = "#87c947";
        });
        btnEditar.addEventListener("click", () => {
          Swal.close();
          handleEditarServicio(evento);
        });
        btnEliminar.addEventListener("click", () => {
          Swal.close();
          handleEliminarServicioCalendario(evento);
        });
      },
    });
  };

  const handleEditarServicio = async (evento) => {
    const tecnico = tecnicos.find((t) => t.id === evento.getResources()[0]?.id);
    const fechaInicio = new Date(evento.start);
    const fechaFin = new Date(evento.end);

    const estadosServicio = {
      confirmado: { nombre: "Confirmado", color: "#87c947", icon: "fa-check" },
      cancelado: { nombre: "Cancelado", color: "#e74c3c", icon: "fa-times" },
      pendiente: { nombre: "Pendiente", color: "#ffd54f", icon: "fa-clock" },
      almuerzo: {
        nombre: "Hora de Almuerzo",
        color: "#3498db",
        icon: "fa-utensils",
      },
      especial: {
        nombre: "Situación Especial",
        color: "#9b59b6",
        icon: "fa-exclamation-circle",
      },
    };

    const { value: formValues } = await mostrarAlerta({
      title: "Editar Servicio",
      html: `
        <form id="servicioForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Nombre del servicio</label>
            <input type="text" id="nombreServicio" class="form-control" required style="border-color: #c5f198;" value="${
              evento.title
            }">
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Descripción</label>
            <textarea id="descripcionServicio" class="form-control" style="border-color: #c5f198;">${
              evento.extendedProps.descripcion || ""
            }</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Estado del Servicio</label>
            <div id="estadosContainer">
              ${Object.entries(estadosServicio)
                .map(
                  ([key, estado]) => `
                  <button type="button" class="estado-btn ${
                    key === evento.extendedProps.estado ? "active" : ""
                  }" 
                    data-estado="${key}" 
                    style="background-color: ${
                      estado.color
                    }; color: white; opacity: ${
                    key === evento.extendedProps.estado ? "1" : "0.6"
                  }">
                    <i class="fas ${estado.icon}"></i>
                    ${estado.nombre}
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
            <small>Técnico: ${tecnico?.title}</small><br>
            <small>Inicio: ${fechaInicio.toLocaleTimeString()}</small><br>
            <small>Fin: ${fechaFin.toLocaleTimeString()}</small>
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
      evento.setProp("title", formValues.nombre);
      evento.setExtendedProp("descripcion", formValues.descripcion);
      evento.setExtendedProp("estado", formValues.estado);
      evento.setProp("backgroundColor", formValues.color);
      evento.setProp("borderColor", formValues.color);
      evento.setProp("textColor", "white");
      evento.setProp("classNames", [`estado-${formValues.estado}`]);
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

  const handleAsignarServicio = (nuevoEvento) => {
    const eventosActualizados = [...eventos, nuevoEvento];
    setEventos(eventosActualizados);
    localStorage.setItem("eventos", JSON.stringify(eventosActualizados));
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
      if (!info.event.display) {
        info.event.setDisplay("auto");
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
      end: new Date(info.date.getTime() + 60 * 60 * 1000), // 1 hora después por defecto
      backgroundColor: getColorByEstado(servicioData.estado),
      borderColor: getColorByEstado(servicioData.estado),
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
                multiMonthMaxColumns: 3,
                multiMonthMinWidth: 350,
                editable: false,
                dayMaxEvents: 3,
                moreLinkContent: (args) => {
                  return `+${args.num} más`;
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
            resourceOrder="title"
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
