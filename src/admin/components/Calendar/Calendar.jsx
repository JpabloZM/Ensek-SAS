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
import "./Calendar.css";
import "./styles/forms.css";

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
    { id: "1", title: "Francisco Londoño", order: 1 },
    { id: "2", title: "Oscar Morales", order: 2 },
    { id: "3", title: "Yeyferson Villada", order: 3 },
    { id: "4", title: "Santiago Henao", order: 4 },
    { id: "5", title: "German Oyola", order: 5 },
    { id: "6", title: "Jhoan Moreno", order: 6 },
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
      const tecnicosActuales =
        JSON.parse(localStorage.getItem("tecnicos")) || tecnicosIniciales;

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

      // Actualizar el estado y localStorage
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
        <span>Editar</span>
      </button>
      <div class="context-menu-separator"></div>
      <button class="context-menu-item eliminar">
        <i class="fas fa-trash-alt"></i>
        <span>Eliminar</span>
      </button>
    `;

    // Posicionar el menú
    const x = event.pageX;
    const y = event.pageY;
    const menuWidth = 180; // Ancho aproximado del menú
    const menuHeight = 100; // Altura aproximada del menú

    // Ajustar posición si el menú se sale de la pantalla
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;

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

  // Contenido personalizado para las etiquetas de recursos
  const resourceLabelContent = useCallback((arg) => {
    // Dividir el nombre completo en nombre y apellido
    const fullName = arg.resource.title;
    let firstName = fullName;
    let lastName = "";

    // Buscar el primer espacio para separar nombre y apellido
    const spaceIndex = fullName.indexOf(" ");
    if (spaceIndex > 0) {
      firstName = fullName.substring(0, spaceIndex);
      lastName = fullName.substring(spaceIndex + 1);
    }

    return {
      html: `<div class="resource-label" 
                style="cursor: context-menu;" 
                data-resource-id="${arg.resource.id}" 
                title="${fullName}">
                <div class="tecnico-nombre">
                  <span class="tecnico-nombre-first">${firstName}</span>
                  <span class="tecnico-nombre-last">${lastName}</span>
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
        className: `estado-${formValues.estado}`, // Usar className en vez de classNames
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
            <label class="form-label required" style="color: #004122;">Nombre del servicio</label>
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
            <small><i class="fas fa-user"></i> Técnico: ${
              tecnico?.title
            }</small>
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
      showConfirmButton: false,
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
