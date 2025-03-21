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
        cancelButton: "swal2-cancel-custom",
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
          });
          return false;
        }
        return nombre;
      },
    });

    if (nombreTecnico) {
      // Obtener técnicos actuales
      const tecnicosActuales =
        JSON.parse(localStorage.getItem("tecnicos")) || tecnicosIniciales;

      // Generar un nuevo ID único
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
    });

    if (result.isConfirmed) {
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

    Swal.fire({
      title: tecnico.title,
      html: `
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
          handleEditarTecnico(tecnico);
        });
        btnEliminar.addEventListener("click", () => {
          Swal.close();
          handleEliminarTecnico(tecnico);
        });
      },
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

    let estadoSeleccionado = null;

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
            <div class="d-flex flex-column gap-2" id="estadosContainer">
              ${Object.entries(estadosServicio)
                .map(
                  ([key, estado]) => `
                <button type="button" class="btn estado-btn w-100 d-flex align-items-center" 
                  data-estado="${key}" 
                  style="background-color: ${estado.color}; color: white; border: none; transition: all 0.3s ease;">
                  <i class="fas ${estado.icon} me-2"></i>
                  ${estado.nombre}
                </button>
              `
                )
                .join("")}
            </div>
          </div>
          <div class="text-muted">
            <small>Técnico: ${tecnico.title}</small><br>
            <small>Inicio: ${fechaInicio.toLocaleTimeString()}</small><br>
            <small>Fin: ${fechaFin.toLocaleTimeString()}</small>
          </div>
          <input type="hidden" id="estadoServicio" value="">
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
      const nuevoEvento = {
        id: Date.now().toString(),
        title: formValues.nombre,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: formValues.color,
        borderColor: formValues.color,
        resourceId: selectInfo.resource.id,
        extendedProps: {
          descripcion: formValues.descripcion,
          tecnico: tecnico.title,
          estado: formValues.estado,
        },
      };

      const eventosActualizados = [...eventos, nuevoEvento];
      setEventos(eventosActualizados);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));

      mostrarAlerta({
        icon: "success",
        title: "Servicio Agregado",
        text: "El servicio ha sido agregado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
    selectInfo.view.calendar.unselect();
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
            <div class="d-flex flex-column gap-2" id="estadosContainer">
              ${Object.entries(estadosServicio)
                .map(
                  ([key, estado]) => `
                  <button type="button" class="btn estado-btn w-100 d-flex align-items-center ${
                    key === evento.extendedProps.estado ? "active" : ""
                  }" 
                    data-estado="${key}" 
                    style="background-color: ${
                      estado.color
                    }; color: white; border: none; transition: all 0.3s ease; opacity: ${
                    key === evento.extendedProps.estado ? "1" : "0.6"
                  }">
                    <i class="fas ${estado.icon} me-2"></i>
                    ${estado.nombre}
                  </button>
                `
                )
                .join("")}
            </div>
          </div>
          <div class="text-muted">
            <small>Técnico: ${tecnico?.title}</small><br>
            <small>Inicio: ${fechaInicio.toLocaleTimeString()}</small><br>
            <small>Fin: ${fechaFin.toLocaleTimeString()}</small>
          </div>
          <input type="hidden" id="estadoServicio" value="${
            evento.extendedProps.estado || ""
          }">
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
      const eventosActualizados = eventos.map((ev) =>
        ev.id === evento.id
          ? {
              ...ev,
              title: formValues.nombre,
              backgroundColor: formValues.color,
              borderColor: formValues.color,
              extendedProps: {
                ...ev.extendedProps,
                descripcion: formValues.descripcion,
                estado: formValues.estado,
              },
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
            events={eventos}
            editable={false}
            droppable={false}
            locale={esLocale}
            allDaySlot={false}
            slotEventOverlap={false}
            eventDrop={(info) => {
              if (info.view.type === "resourceTimeGridDay") {
                handleEventDrop(info);
              } else {
                info.revert();
              }
            }}
            eventReceive={(info) => {
              if (info.view.type === "resourceTimeGridDay") {
                handleEventReceive(info);
              } else {
                info.revert();
              }
            }}
            eventContent={(arg) => (
              <div className="fc-event-main-content">
                <div className="fc-event-title">{arg.event.title}</div>
                <div className="fc-event-description">
                  {arg.event.extendedProps.descripcion}
                </div>
              </div>
            )}
            schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
            resourceLabelContent={resourceLabelContent}
            selectable={true}
            select={(info) => {
              if (info.view.type === "resourceTimeGridDay") {
                handleDateSelect(info);
              }
            }}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
