import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  setupCalendarSelectVisuals,
  addTimeLabelsToSelection,
} from "./selectFix";
import "./Calendar.css";
import "./styles/forms.css";
import "./styles/service-card-override.css"; // Asegurar que estos estilos se apliquen al final
import "./styles/add-technician-form.css"; // Estilos específicos para el formulario de agregar técnico
import "./styles/edit-technician-form.css"; // Estilos específicos para el formulario de editar técnico
import "./styles/dark-mode-form-fields.css"; // Estilos para campos de formulario en modo oscuro
import "./styles/now-indicator.css"; // Estilos para el indicador de hora actual

const Calendar = ({ darkMode = false }) => {
  // Manejador para el drop externo en el calendario (drag & drop de servicios)
  const handleExternalDrop = async (info) => {
    console.log("🎯 handleExternalDrop disparado:", info);
    console.log("📊 Información completa del drop:", {
      date: info.date,
      dateStr: info.dateStr,
      allDay: info.allDay,
      resource: info.resource,
      jsEvent: info.jsEvent,
      view: info.view?.type,
    });

    // Obtener información del evento arrastrado
    const draggedEventId = info.draggedEl?.getAttribute("data-service-id");
    const servicioArrastrado = serviciosPendientes.find(
      (servicio) =>
        String(servicio.id) === String(draggedEventId) ||
        String(servicio._id) === String(draggedEventId)
    );

    if (!servicioArrastrado) {
      console.warn("No se encontró el servicio arrastrado:", draggedEventId);
      mostrarAlerta({
        icon: "warning",
        title: "Error",
        text: "No se pudo encontrar el servicio seleccionado.",
        confirmButtonColor: "#87c947",
      });
      return;
    }

    // Obtener información del técnico y horario de destino
    const tecnico = tecnicos.find((t) => t.id === info.resource?.id);
    if (!tecnico) {
      console.warn("No se encontró el técnico:", info.resource?.id);
      mostrarAlerta({
        icon: "warning",
        title: "Error",
        text: "Debe soltar el servicio en la columna de un técnico específico.",
        confirmButtonColor: "#87c947",
      });
      return;
    }

    // Usar la fecha exacta donde se soltó el servicio
    let fechaInicio;

    // Si tenemos dateStr, usarlo (más preciso)
    if (info.dateStr) {
      fechaInicio = new Date(info.dateStr);
    } else {
      fechaInicio = new Date(info.date);
    }

    // Si el evento no es de todo el día, y tenemos información más precisa del evento
    if (!info.allDay && info.jsEvent) {
      try {
        // Intentar obtener la hora más precisa desde el evento del mouse
        const calendarElement = document.querySelector(".fc-timegrid-slots");
        if (calendarElement) {
          const rect = calendarElement.getBoundingClientRect();
          const mouseY = info.jsEvent.clientY - rect.top;

          // Calcular la hora basada en la posición del mouse
          const slotHeight = 30; // altura de cada slot de 30 minutos
          const slotsFromTop = Math.floor(mouseY / slotHeight);
          const minutesFromMidnight = slotsFromTop * 30;

          // Crear nueva fecha con la hora calculada
          const fechaBase = new Date(fechaInicio);
          fechaBase.setHours(0, 0, 0, 0); // Resetear a medianoche
          fechaBase.setMinutes(minutesFromMidnight); // Agregar los minutos calculados

          // Solo usar esta fecha si parece razonable (entre 0 y 24 horas)
          if (minutesFromMidnight >= 0 && minutesFromMidnight < 1440) {
            fechaInicio = fechaBase;
            console.log("🎯 Hora calculada desde posición del mouse:", {
              mouseY,
              slotsFromTop,
              minutesFromMidnight,
              nuevaHora: fechaInicio.toLocaleString(),
            });
          }
        }
      } catch (error) {
        console.warn("Error calculando hora precisa:", error);
      }
    }

    console.log("📅 Fecha y hora donde se soltó el servicio:", {
      original: info.date,
      dateStr: info.dateStr,
      fechaInicioFinal: fechaInicio.toISOString(),
      horaLocal: fechaInicio.toLocaleString(),
      allDay: info.allDay,
    });

    // Por defecto, asignar 1 hora de duración
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

    // Verificar si ya existe un evento en este horario
    const eventoExistente = eventos.find((evento) => {
      const eventoInicio = new Date(evento.start);
      const eventoFinEvento = new Date(evento.end);
      const mismoTecnico = evento.resourceId === info.resource.id;

      const hayConflicto =
        mismoTecnico &&
        ((fechaInicio >= eventoInicio && fechaInicio < eventoFinEvento) ||
          (fechaFin > eventoInicio && fechaFin <= eventoFinEvento) ||
          (fechaInicio <= eventoInicio && fechaFin >= eventoFinEvento));

      return hayConflicto;
    });

    if (eventoExistente) {
      mostrarAlerta({
        icon: "info",
        title: "Espacio Ocupado",
        text: "Ya existe un servicio programado en este horario. Seleccione otro horario.",
        timer: 2000,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
      return;
    }

    // Crear los estados del servicio para el modal
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
      facturado: {
        nombre: "Facturado",
        color: "#7f8c8d",
        icon: "fa-file-invoice-dollar",
        gradient: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
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

    // Mostrar modal para configurar el servicio asignado
    const { value: formValues } = await mostrarAlerta({
      title: "Asignar Servicio al Calendario",
      html: `
      <div id="servicioForm">
        <div class="form-row">
          <div class="input-group">
            <label>Tipo de servicio</label>
            <select id="nombre" class="form-field">
              <option value="pest-control" ${
                servicioArrastrado.serviceType === "pest-control"
                  ? "selected"
                  : ""
              }>Control de Plagas</option>
              <option value="gardening" ${
                servicioArrastrado.serviceType === "gardening" ? "selected" : ""
              }>Jardinería</option>
              <option value="residential-fumigation" ${
                servicioArrastrado.serviceType === "residential-fumigation"
                  ? "selected"
                  : ""
              }>Fumigación Residencial</option>
              <option value="commercial-fumigation" ${
                servicioArrastrado.serviceType === "commercial-fumigation"
                  ? "selected"
                  : ""
              }>Fumigación Comercial</option>
              <option value="custom" ${
                servicioArrastrado.serviceType === "custom" ? "selected" : ""
              }>Otro</option>
            </select>
          </div>
          <div class="input-group">
            <label>Cliente</label>
            <input type="text" id="clientName" class="form-field" placeholder="Nombre del cliente" value="${
              servicioArrastrado.clientName || servicioArrastrado.name || ""
            }">
          </div>
        </div>
        
        <div class="form-row">
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="clientEmail" class="form-field" placeholder="correo@ejemplo.com" value="${
              servicioArrastrado.clientEmail || servicioArrastrado.email || ""
            }">
          </div>
          <div class="input-group">
            <label>Teléfono</label>
            <input type="tel" id="clientPhone" class="form-field" placeholder="Teléfono de contacto" value="${
              servicioArrastrado.clientPhone || servicioArrastrado.phone || ""
            }">
          </div>
        </div>
        
        <div class="form-row">
          <div class="input-group">
            <label>Dirección</label>
            <input type="text" id="address" class="form-field" placeholder="Dirección completa" value="${
              servicioArrastrado.address || ""
            }">
          </div>
          <div class="input-group">
            <label>Duración (horas)</label>
            <select id="duracion" class="form-field">
              <option value="0.5">30 minutos</option>
              <option value="1" selected>1 hora</option>
              <option value="1.5">1 hora 30 minutos</option>
              <option value="2">2 horas</option>
              <option value="2.5">2 horas 30 minutos</option>
              <option value="3">3 horas</option>
              <option value="4">4 horas</option>
              <option value="6">6 horas</option>
              <option value="8">8 horas</option>
            </select>
          </div>
        </div>
        
        <div class="form-row description-row">
          <div class="input-group full-width">
            <label>Descripción</label>
            <textarea id="descripcion" class="form-field" placeholder="Descripción detallada del servicio" rows="3">${
              servicioArrastrado.descripcion ||
              servicioArrastrado.description ||
              ""
            }</textarea>
          </div>
        </div>
        
        <div class="form-row mt-2">
          <div class="input-group full-width">
            <label>Estado del servicio</label>
            <div id="estadosContainer">
              ${Object.entries(estadosServicio)
                .map(
                  ([key, estado]) => `
                  <button 
                    type="button" 
                    class="estado-btn ${key === "confirmado" ? "active" : ""}" 
                    data-estado="${key}" 
                    style="background: ${estado.gradient}; opacity: ${
                    key === "confirmado" ? "1" : "0.6"
                  };"
                  >
                    <i class="fas ${estado.icon}"></i>
                    ${estado.nombre}
                  </button>
                `
                )
                .join("")}
            </div>
            <input type="hidden" id="estadoServicio" value="confirmado">
          </div>
        </div>
        
        <div class="form-row tech-info">
          <div class="input-group full-width">
            <div class="tech-details-card">
              <div class="tech-header">
                <i class="fas fa-info-circle"></i>
                <span>Información de Asignación</span>
              </div>
              <div class="tech-details-content">
                <div class="tech-detail-item">
                  <i class="fas fa-user"></i>
                  <span>Técnico: <strong>${tecnico.title}</strong></span>
                </div>
                <div class="tech-time-row">
                  <div class="tech-detail-item time-item">
                    <i class="fas fa-clock"></i>
                    <span>Inicio: <strong>${fechaInicio
                      .toLocaleTimeString()
                      .replace(/(:\d{2}):\d{2}$/, "$1")}</strong></span>
                  </div>
                  <div class="tech-detail-item time-item time-end">
                    <i class="fas fa-hourglass-end"></i>
                    <span id="tiempoFin">Fin: <strong>${fechaFin
                      .toLocaleTimeString()
                      .replace(/(:\d{2}):\d{2}$/, "$1")}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style>
          /* Usar los mismos estilos que en handleDateSelect */
          #servicioForm {
            padding: 15px 15px 5px 15px;
            background-color: #2d3748;
            border-radius: 10px;
            width: 600px;
            max-width: 600px;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .form-row {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            width: 100%;
            gap: 20px;
            box-sizing: border-box;
          }
          
          .input-group {
            display: flex;
            flex-direction: column;
            width: 270px;
            max-width: 270px;
            min-width: 270px;
            box-sizing: border-box;
          }
          
          .input-group.full-width {
            width: 100%;
            max-width: 100%;
            min-width: 100%;
          }
          
          .input-group label {
            color: #87c947;
            font-weight: 500;
            margin-bottom: 8px;
            display: block;
            font-size: 14px;
          }
          
          .form-field {
            padding: 10px 12px;
            border: 1px solid #4a5568;
            border-radius: 6px;
            background-color: #1a202c;
            color: white;
            width: 100%;
            height: 40px;
            box-sizing: border-box;
            font-size: 14px;
            min-height: 40px;
            text-align: left;
          }
          
          .form-field::placeholder {
            color: #718096;
          }
          
          .form-field:focus {
            border-color: #87c947;
            outline: none;
            box-shadow: 0 0 0 1px #87c947;
          }
          
          textarea.form-field {
            height: auto;
            min-height: 80px;
            resize: vertical;
            width: 100%;
            max-width: 100%;
            min-width: 100%;
            padding: 12px;
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
          }
          
          /* Estilos para los botones de estado */
          #estadosContainer {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
            justify-content: center;
          }
          
          .estado-btn {
            padding: 8px 15px;
            border-radius: 6px;
            border: none;
            color: white;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.6;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .estado-btn i {
            font-size: 14px;
          }
          
          .estado-btn.active {
            opacity: 1;
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          .tech-details-card {
            width: 100%;
            background-color: #1a202c;
            border-radius: 8px;
            border-left: 4px solid #87c947;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            margin-top: 0;
            margin-bottom: 0;
          }
          
          .tech-header {
            background-color: #22252f;
            padding: 10px 15px;
            color: #87c947;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #2d3748;
            border-left: 4px solid #87c947;
            margin-left: -4px;
          }
          
          .tech-details-content {
            padding: 10px 15px;
          }
          
          .tech-detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #a0aec0;
            margin-bottom: 6px;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .tech-detail-item:last-child {
            margin-bottom: 0;
          }
          
          .tech-detail-item i {
            color: #87c947;
            width: 16px;
            text-align: center;
          }
          
          .tech-detail-item strong {
            color: #e2e8f0;
            font-weight: 500;
          }
          
          .tech-time-row {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 30px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #2d3748;
          }
          
          .tech-detail-item.time-item {
            margin-bottom: 0;
          }
          
          .tech-detail-item.time-end {
            margin-left: 20px;
          }
          
          .mt-2 {
            margin-top: 10px;
          }
          
          select.form-field, input.form-field {
            min-width: 100%;
            max-width: 100%;
            width: 100%;
          }
        </style>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "ASIGNAR",
      cancelButtonText: "CANCELAR",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#383a46",
      background: "#1e1e2f",
      color: "#ffffff",
      buttonsStyling: true,
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-button swal2-styled",
        cancelButton: "swal2-cancel-button swal2-styled",
        htmlContainer: "swal2-html-custom",
        actions: "swal2-actions-custom",
      },
      didOpen: () => {
        // Agregar event listeners para los botones de estado
        const estadoBtns = document.querySelectorAll(".estado-btn");
        const estadoInput = document.getElementById("estadoServicio");

        estadoBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remover clase active de todos los botones
            estadoBtns.forEach((b) => {
              b.classList.remove("active");
              b.style.opacity = "0.6";
            });

            // Agregar clase active al botón clickeado
            btn.classList.add("active");
            btn.style.opacity = "1";
            btn.style.transform = "scale(1.05)";

            // Actualizar el input hidden
            estadoInput.value = btn.getAttribute("data-estado");
          });
        });

        // Agregar event listener para cambio de duración
        const duracionSelect = document.getElementById("duracion");
        const tiempoFinElement = document.getElementById("tiempoFin");

        duracionSelect.addEventListener("change", () => {
          const duracionHoras = parseFloat(duracionSelect.value);
          const nuevaFechaFin = new Date(
            fechaInicio.getTime() + duracionHoras * 60 * 60 * 1000
          );
          tiempoFinElement.innerHTML = `Fin: <strong>${nuevaFechaFin
            .toLocaleTimeString()
            .replace(/(:\d{2}):\d{2}$/, "$1")}</strong>`;
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value;
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const address = document.getElementById("address").value;
        const descripcion = document.getElementById("descripcion").value;
        const estadoServicio = document.getElementById("estadoServicio").value;
        const duracion = parseFloat(document.getElementById("duracion").value);

        if (!nombre || !clientName) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor complete al menos el tipo de servicio y el nombre del cliente",
            confirmButtonColor: "#87c947",
          });
          return false;
        }

        return {
          serviceType: nombre,
          clientName,
          clientEmail,
          clientPhone,
          address,
          descripcion,
          estado: estadoServicio,
          duracion,
        };
      },
    });

    if (formValues) {
      try {
        // Calcular fecha fin basada en la duración seleccionada
        const duracionMs = formValues.duracion * 60 * 60 * 1000;
        const fechaFinCalculada = new Date(fechaInicio.getTime() + duracionMs);

        // Función para formatear fecha manteniendo la zona horaria local
        const formatearFechaLocal = (fecha) => {
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, "0");
          const day = String(fecha.getDate()).padStart(2, "0");
          const hours = String(fecha.getHours()).padStart(2, "0");
          const minutes = String(fecha.getMinutes()).padStart(2, "0");
          const seconds = String(fecha.getSeconds()).padStart(2, "0");

          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        const startFormatted = formatearFechaLocal(fechaInicio);
        const endFormatted = formatearFechaLocal(fechaFinCalculada);

        console.log("🕐 Fechas calculadas:", {
          fechaInicioOriginal: fechaInicio.toLocaleString(),
          fechaFinCalculada: fechaFinCalculada.toLocaleString(),
          startFormatted: startFormatted,
          endFormatted: endFormatted,
          duracionHoras: formValues.duracion,
        });

        // Crear el evento para asignar
        const eventoParaAsignar = {
          start: startFormatted,
          end: endFormatted,
          resourceId: tecnico.id,
          title: `${mapServiceTypeToSpanish(formValues.serviceType)} - ${
            formValues.clientName
          }`,
          extendedProps: {
            ...servicioArrastrado,
            clientName: formValues.clientName,
            clientEmail: formValues.clientEmail,
            clientPhone: formValues.clientPhone,
            address: formValues.address,
            descripcion: formValues.descripcion,
            serviceType: formValues.serviceType,
            estado: formValues.estado,
            scheduledStart: startFormatted,
            scheduledEnd: endFormatted,
          },
        };

        console.log("Asignando servicio con datos:", eventoParaAsignar);

        // Activar flag para evitar procesamiento automático
        setIsProcessingTempEvent(true);

        // Crear un ID temporal único que persista
        const tempId = `drag-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Primero agregar el evento al estado local para que aparezca inmediatamente
        const eventoLocal = {
          ...eventoParaAsignar,
          id: tempId,
          backgroundColor: getColorByEstado(formValues.estado),
          borderColor: getColorByEstado(formValues.estado),
          className: `estado-${formValues.estado}`,
          textColor: "white",
          display: "block",
          // Marcar como evento local temporal para evitar que sea sobrescrito
          extendedProps: {
            ...eventoParaAsignar.extendedProps,
            isLocalEvent: true,
            localTempId: tempId,
            preserveEvent: true,
          },
        };

        console.log("🎯 Creando evento local temporal:", eventoLocal);

        // Agregar inmediatamente al estado local
        setEventos((prevEventos) => {
          const nuevosEventos = [...prevEventos, eventoLocal];
          console.log(
            "📊 Estado de eventos después de agregar temporal:",
            nuevosEventos.length
          );
          return nuevosEventos;
        });

        // Crear el servicio en el backend en paralelo
        try {
          const servicioActualizado = await handleAsignarServicio(
            eventoParaAsignar,
            servicioArrastrado._id || servicioArrastrado.id,
            [tecnico.id],
            true // skipRefresh = true para evitar que sobrescriba nuestro evento local
          );

          if (servicioActualizado && servicioActualizado._id) {
            console.log(
              "✅ Servicio creado exitosamente, actualizando ID:",
              servicioActualizado._id
            );

            // Actualizar el evento temporal con el ID real del backend
            setEventos((prevEventos) =>
              prevEventos.map((evento) => {
                if (
                  evento.id === tempId ||
                  evento.extendedProps?.localTempId === tempId
                ) {
                  return {
                    ...evento,
                    id: servicioActualizado._id,
                    extendedProps: {
                      ...evento.extendedProps,
                      serviceId: servicioActualizado._id,
                      isLocalEvent: false, // Ya no es temporal
                    },
                  };
                }
                return evento;
              })
            );

            // Después de 3 segundos, permitir que el sistema refresh para sincronizar con el backend
            setTimeout(() => {
              console.log(
                "🔄 Permitiendo refresh del sistema después de 3 segundos"
              );
              setEventos((prevEventos) =>
                prevEventos.map((evento) => {
                  if (evento.id === servicioActualizado._id) {
                    return {
                      ...evento,
                      extendedProps: {
                        ...evento.extendedProps,
                        preserveEvent: false, // Permitir actualizaciones del backend
                      },
                    };
                  }
                  return evento;
                })
              );
              // Desactivar flag después de completar el proceso
              setIsProcessingTempEvent(false);
            }, 3000);

            mostrarAlerta({
              icon: "success",
              title: "Servicio Asignado",
              text: "El servicio ha sido asignado correctamente al calendario.",
              timer: 1500,
              showConfirmButton: false,
              background: "#f8ffec",
              color: "#004122",
            });
          } else {
            console.error(
              "❌ Error en la creación del servicio, removiendo evento temporal"
            );
            // Si falló, remover el evento temporal y desactivar flag
            setEventos((prevEventos) =>
              prevEventos.filter(
                (evento) =>
                  evento.id !== tempId &&
                  evento.extendedProps?.localTempId !== tempId
              )
            );
            setIsProcessingTempEvent(false);
          }
        } catch (error) {
          console.error("❌ Error al crear servicio:", error);
          // Remover el evento temporal si hay error y desactivar flag
          setEventos((prevEventos) =>
            prevEventos.filter(
              (evento) =>
                evento.id !== tempId &&
                evento.extendedProps?.localTempId !== tempId
            )
          );
          setIsProcessingTempEvent(false);
        }
      } catch (error) {
        console.error("Error al asignar servicio:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo asignar el servicio. Por favor, intente nuevamente.",
          confirmButtonColor: "#87c947",
        });
      }
    }
  };
  // Render personalizado para mostrar nombre, tipo de servicio y hora en cada evento
  // Función para traducir el tipo de servicio si es necesario

  const renderEventContent = (eventInfo) => {
    const clientName =
      eventInfo.event.extendedProps.clientName ||
      eventInfo.event.extendedProps.cliente ||
      "";
    let serviceTypeRaw =
      eventInfo.event.extendedProps.serviceType ||
      eventInfo.event.extendedProps.nombre;
    if (!serviceTypeRaw && eventInfo.event.title) {
      const parts = eventInfo.event.title.split(" - ");
      if (
        parts.length === 2 &&
        clientName &&
        parts[1].trim() === clientName.trim()
      ) {
        serviceTypeRaw = parts[0];
      }
    }

    // Detectar si es un servicio personalizado (cuando clientName está vacío pero hay serviceType)
    const isCustomService = !clientName && serviceTypeRaw;

    const serviceType = serviceTypeRaw
      ? mapServiceTypeToSpanish(serviceTypeRaw)
      : "Sin tipo";

    // Horario inicio y fin
    let startTime = "";
    let endTime = "";
    if (eventInfo.event.start) {
      const dateObj = new Date(eventInfo.event.start);
      startTime = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (eventInfo.event.end) {
      const dateObj = new Date(eventInfo.event.end);
      endTime = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Forzar color de texto blanco
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2px 0",
          color: "white",
        }}
      >
        {isCustomService ? (
          // Para servicios personalizados, mostrar solo el nombre del servicio
          <span style={{ fontWeight: "bold" }}>{serviceTypeRaw}</span>
        ) : (
          // Para servicios normales, mostrar cliente y tipo
          <>
            {clientName && (
              <span style={{ fontWeight: "bold" }}>{clientName}</span>
            )}
            <span style={{ fontSize: "0.95em" }}>{serviceType}</span>
          </>
        )}
        <span style={{ fontSize: "0.9em" }}>
          {startTime} - {endTime}
        </span>
      </div>
    );
  };
  useEffect(() => {
    // Forzar el indicador de hora detrás de los eventos
    const style = document.createElement("style");
    style.innerHTML = `
      .fc-timegrid-now-indicator-line { z-index: 0 !important; }
      .fc-event, .fc-timegrid-event { z-index: 2 !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { services, loading, error, updateService, getAllServices } =
    useServices();
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [isProcessingTempEvent, setIsProcessingTempEvent] = useState(false); // Nueva variable para controlar procesamiento

  // Inicializar eventos desde localStorage si existen
  const [eventos, setEventos] = useState(() => {
    try {
      const savedEvents = localStorage.getItem("eventos");
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        console.log(
          "📚 Cargando eventos desde localStorage:",
          parsedEvents.length
        );
        return parsedEvents;
      }
    } catch (error) {
      console.error("Error cargando eventos desde localStorage:", error);
    }
    return [];
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [localServices, setLocalServices] = useState([]); // Agregar estado para servicios locales
  const { mostrarAlerta } = useAlertas();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ x: 0, y: 0 });
  const [mostrarMenuContextual, setMostrarMenuContextual] = useState(false);
  const [mostrarMenuContextualTecnico, setMostrarMenuContextualTecnico] =
    useState(false);
  // Referencia para acceder al componente FullCalendar
  const calendarRef = useRef(null);

  // Función para obtener la API del calendario
  const getCalendarApi = () => {
    if (calendarRef.current) {
      return calendarRef.current.getApi();
    }
    return null;
  };

  // Efecto para sincronizar eventos con localStorage
  useEffect(() => {
    try {
      localStorage.setItem("eventos", JSON.stringify(eventos));
      console.log("💾 Eventos sincronizados con localStorage:", eventos.length);
    } catch (error) {
      console.error("Error guardando eventos en localStorage:", error);
    }
  }, [eventos]);

  // Función para desplazarse a la hora actual
  const scrollToCurrentTime = () => {
    const calendarApi = getCalendarApi();
    if (calendarApi && calendarApi.view.type === "resourceTimeGrid") {
      // Asegurar que primero se renderice el calendario
      setTimeout(() => {
        // Encontrar el elemento del indicador de hora actual
        const nowIndicator = document.querySelector(
          ".fc-timegrid-now-indicator-line"
        );
        if (nowIndicator) {
          // Desplazarse a la posición del indicador (con un offset para centrarlo)
          const scrollContainer = document.querySelector(
            ".fc-scroller-liquid-absolute"
          );
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const indicatorRect = nowIndicator.getBoundingClientRect();
            const offset =
              indicatorRect.top - containerRect.top - containerRect.height / 2;

            scrollContainer.scrollTop += offset;
          }
        }
      }, 100);
    }
  };

  // Efecto para la carga inicial
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

  // Función para mapear el estado del servicio al correspondiente estado en español
  const mapStatusToEstado = (status) => {
    switch (status) {
      case "confirmed":
        return "confirmado";
      case "pending":
        return "pendiente";
      case "cancelled":
        return "cancelado";
      case "completed":
        return "completado";
      case "billed":
        return "facturado";
      case "special":
        return "especial";
      case "lunch":
        return "almuerzo";
      default:
        return "pendiente";
    }
  };

  // Función para mapear el estado de español a inglés para el backend
  const mapEstadoToStatus = (estado) => {
    switch (estado) {
      case "confirmado":
        return "confirmed";
      case "pendiente":
        return "pending";
      case "cancelado":
        return "cancelled";
      case "completado":
        return "completed";
      case "facturado":
        return "billed";
      case "especial":
        return "special";
      case "almuerzo":
        return "lunch";
      default:
        return "pending";
    }
  };

  // Función para mapear los tipos de servicio del inglés al español
  const mapServiceTypeToSpanish = (serviceType) => {
    switch (serviceType) {
      case "pest-control":
        return "Control de Plagas";
      case "gardening":
        return "Jardinería";
      case "residential-fumigation":
        return "Fumigación Residencial";
      case "commercial-fumigation":
        return "Fumigación Comercial";
      case "other":
        return "Otro";
      default:
        return serviceType; // Si no coincide, devolver el valor original
    }
  };

  // Función para obtener el color según el estado del servicio
  const getServiceColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#87c947"; // Verde
      case "pending":
        return "#ffd54f"; // Amarillo
      case "cancelled":
        return "#e74c3c"; // Rojo
      case "completed":
        return "#3498db"; // Azul
      case "billed":
        return "#7f8c8d"; // Gris
      case "special":
        return "#9b59b6"; // Morado
      case "lunch":
        return "#3498db"; // Azul para almuerzo
      default:
        return "#ffd54f"; // Por defecto amarillo
    }
  };

  // Function to process services data
  const processServices = useCallback(
    (servicesData) => {
      // ⭐ SOLUCIÓN RADICAL: No procesar NADA si estamos manejando eventos temporales
      if (isProcessingTempEvent) {
        console.log(
          "� BLOQUEADO: processServices - asignación manual en curso"
        );
        return;
      }

      console.log("Processing services data:", servicesData);

      // Actualizar servicios locales
      setLocalServices(servicesData);

      // Procesar servicios pendientes - solo incluir los que NO tienen técnico asignado
      const pendingServices = servicesData
        .filter(
          (service) => service.status === "pending" && !service.technician
        )
        .map((service) => {
          // Calcular duración basada en scheduledStart/End
          let calculatedDuration = 60; // default 60 minutos
          if (service.scheduledStart && service.scheduledEnd) {
            const start = new Date(service.scheduledStart);
            const end = new Date(service.scheduledEnd);
            calculatedDuration = Math.round((end - start) / (1000 * 60)); // diferencia en minutos
            console.log(
              `Service ${service._id}: scheduledStart=${service.scheduledStart}, scheduledEnd=${service.scheduledEnd}, duration=${calculatedDuration} minutes`
            );
          }

          return {
            _id: service._id,
            id: service._id,
            nombre: mapServiceTypeToSpanish(service.serviceType),
            descripcion: service.description || "",
            duracion: calculatedDuration,
            color: "#ffd54f",
            estado: service.status || "pendiente",
            clientName: service.name,
            clientEmail: service.email,
            clientPhone: service.phone,
            address: service.address,
            preferredDate: service.preferredDate,
            scheduledStart: service.scheduledStart,
            scheduledEnd: service.scheduledEnd,
            updatedAt: service.updatedAt,
            createdAt: service.createdAt,
          };
        });

      console.log("Pending services:", pendingServices);
      setServiciosPendientes(pendingServices);

      // ⭐ CRÍTICO: NO procesar eventos del calendario si hay eventos manuales presentes
      const tieneEventosManuales = JSON.parse(
        localStorage.getItem("eventos") || "[]"
      ).some(
        (evento) =>
          evento.extendedProps?.preserveEvent ||
          evento.extendedProps?.isLocalEvent ||
          evento.extendedProps?.backendProcessed ||
          evento.extendedProps?.scheduledStart ||
          evento.id?.toString().includes("-6866dfd22577a11def1e50b0-") ||
          evento.id?.toString().includes(`${new Date().getFullYear()}`)
      );

      if (tieneEventosManuales) {
        console.log(
          "� BLOQUEADO: processServices - eventos manuales detectados, manteniendo calendario actual"
        );
        return;
      }

      // Solo procesar eventos automáticos si NO hay eventos manuales
      const calendarEvents = servicesData
        .filter((service) => {
          if (service.technician) {
            return true;
          }
          return false;
        })
        .map((service) => {
          // Calcular fechas de inicio y fin para eventos automáticos únicamente
          let startDate, endDate;

          if (service.scheduledStart && service.scheduledEnd) {
            startDate = service.scheduledStart;
            endDate = service.scheduledEnd;
          } else if (service.preferredDate) {
            startDate = service.preferredDate;
            if (service.scheduledStart && service.scheduledEnd) {
              const duration =
                new Date(service.scheduledEnd) -
                new Date(service.scheduledStart);
              endDate = new Date(
                new Date(service.preferredDate).getTime() + duration
              ).toISOString();
            } else {
              endDate = new Date(
                new Date(service.preferredDate).getTime() + 60 * 60 * 1000
              ).toISOString();
            }
          } else {
            const now = new Date();
            startDate = now.toISOString();
            endDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          }

          const event = {
            id: service._id,
            title: mapServiceTypeToSpanish(service.serviceType),
            start: startDate,
            end: endDate,
            ...(service.technician && { resourceId: service.technician }),
            backgroundColor: getServiceColor(service.status),
            borderColor: getServiceColor(service.status),
            extendedProps: {
              estado: mapStatusToEstado(service.status),
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
              scheduledStart: service.scheduledStart,
              scheduledEnd: service.scheduledEnd,
              automaticEvent: true, // Marcar como evento automático
            },
          };

          const durationMinutes = Math.round(
            (new Date(endDate) - new Date(startDate)) / (1000 * 60)
          );
          console.log(
            `Created automatic calendar event for service ${service._id}:`,
            {
              title: event.title,
              start: startDate,
              end: endDate,
              durationMinutes: durationMinutes,
              estado: event.extendedProps.estado,
              backgroundColor: event.backgroundColor,
            }
          );

          return event;
        })
        .filter(Boolean);

      console.log("Automatic calendar events:", calendarEvents);

      // Reemplazar SOLO los eventos automáticos, preservar todos los manuales
      setEventos((prevEventos) => {
        // Mantener TODOS los eventos manuales
        const eventosManuales = prevEventos.filter(
          (evento) =>
            evento.extendedProps?.preserveEvent ||
            evento.extendedProps?.isLocalEvent ||
            evento.extendedProps?.backendProcessed ||
            evento.extendedProps?.scheduledStart ||
            evento.id?.toString().includes("-6866dfd22577a11def1e50b0-") ||
            evento.id?.toString().startsWith("drag-") ||
            evento.id?.toString().includes(`${new Date().getFullYear()}`)
        );

        // Combinar eventos manuales con los nuevos eventos automáticos
        const merged = [...eventosManuales, ...calendarEvents];

        console.log(
          `� Eventos finales: ${merged.length} (${eventosManuales.length} manuales + ${calendarEvents.length} automáticos)`
        );

        return merged;
      });
    },
    [isProcessingTempEvent] // Eliminar eventos como dependencia para evitar loops
  );

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
  }, [services, loading, processServices]); // REMOVIDO eventos de las dependencias

  // Efecto para detectar y manejar actualizaciones del calendario mediante eventos personalizados
  useEffect(() => {
    console.log("Setting up calendar update event listener");

    // Handler para el evento personalizado
    const handleCalendarUpdateEvent = (e) => {
      console.log("Calendar update event detected:", e.detail);

      try {
        // Si hay información del evento, añadirlo directamente al calendario
        if (e.detail && e.detail.event) {
          const eventData = e.detail.event;

          // Actualizar el estado de eventos
          setEventos((prevEventos) => {
            // Filtrar eventos existentes con el mismo ID para evitar duplicados
            const filteredEvents = prevEventos.filter(
              (ev) =>
                ev.id !== eventData.id || ev.resourceId !== eventData.resourceId
            );
            return [...filteredEvents, eventData];
          });

          // Intentar actualizar el calendario usando el ref si está disponible
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
              // Eliminar evento existente si existe
              const existingEvent = calendarApi.getEventById(eventData.id);
              if (existingEvent) {
                existingEvent.remove();
              }

              // Añadir el nuevo evento
              calendarApi.addEvent(eventData);

              // Refrescar todo el calendario
              calendarApi.refetchEvents();
              console.log("Calendar refreshed via calendarRef API");
            }
          }

          // Limpiamos el servicio de la lista de pendientes
          if (eventData.id) {
            setServiciosPendientes((prev) =>
              prev.filter(
                (s) => s.id !== eventData.id && s._id !== eventData.id
              )
            );
          }
        } else {
          // Si no hay información detallada, refrescar todo el calendario
          console.log("No event details provided, refreshing full calendar");

          // Refrescar calendario usando el ref
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
              calendarApi.refetchEvents();
            }
          }

          // Recargar todos los servicios
          if (typeof getAllServices === "function") {
            getAllServices(true);
          }
        }
      } catch (error) {
        console.error("Error handling calendar update event:", error);
      }
    };

    // Registrar el event listener
    document.addEventListener(
      "calendar-update-needed",
      handleCalendarUpdateEvent
    );

    // Limpieza al desmontar
    return () => {
      document.removeEventListener(
        "calendar-update-needed",
        handleCalendarUpdateEvent
      );
    };
  }, []);

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
        name: nuevoServicio.name || nuevoServicio.clientName,
        email: nuevoServicio.email || nuevoServicio.clientEmail,
        phone: nuevoServicio.phone || nuevoServicio.clientPhone,
        address: nuevoServicio.address || "No especificada",
        serviceType: nuevoServicio.serviceType || "Control de Plagas", // Valor por defecto más común
        description:
          nuevoServicio.description || nuevoServicio.descripcion || "",
        preferredDate: nuevoServicio.preferredDate || currentDate,
        scheduledStart: nuevoServicio.scheduledStart || null, // IMPORTANTE: Mantener los campos de horario
        scheduledEnd: nuevoServicio.scheduledEnd || null, // IMPORTANTE: Mantener los campos de horario
        // Asegurarse de que document siempre tenga un valor válido
        document: nuevoServicio.document || "1234567890",
        // Usar el estado explícito si viene del calendario, o usar el mapeo
        status:
          nuevoServicio.status ||
          (nuevoServicio.isFromCalendar
            ? mapEstadoToStatus(nuevoServicio.estado)
            : "pending"),
        technician: nuevoServicio.technicianId || null, // Asignar técnico si viene del calendario
      };

      console.log("Creando nuevo servicio con datos:", serviceData);

      // Debug: Log específico de los campos de tiempo
      console.log("=== DEBUG HORARIOS EN handleAgregarServicio ===");
      console.log("scheduledStart original:", nuevoServicio.scheduledStart);
      console.log("scheduledEnd original:", nuevoServicio.scheduledEnd);
      console.log("scheduledStart en serviceData:", serviceData.scheduledStart);
      console.log("scheduledEnd en serviceData:", serviceData.scheduledEnd);
      if (serviceData.scheduledStart && serviceData.scheduledEnd) {
        const startTime = new Date(serviceData.scheduledStart);
        const endTime = new Date(serviceData.scheduledEnd);
        const durationMinutes = (endTime - startTime) / (1000 * 60);
        console.log("Duración calculada (minutos):", durationMinutes);
      }
      console.log("=== FIN DEBUG HORARIOS ===");

      // Create service in database
      console.log("=== CALENDAR - ANTES DE CREAR SERVICIO ===");
      console.log("serviceData a enviar:", serviceData);

      const createdService = await serviceService.saveService(serviceData);
      console.log("=== CALENDAR - DESPUÉS DE CREAR SERVICIO ===");
      console.log("createdService:", createdService);
      console.log("Tipo de createdService:", typeof createdService);
      console.log("¿Es undefined?", createdService === undefined);
      console.log("¿Es null?", createdService === null);

      // Verificar que el servicio se creó correctamente
      if (!createdService) {
        throw new Error(
          "No se pudo crear el servicio. La respuesta del servidor fue vacía."
        );
      }

      if (!createdService._id) {
        console.error("Servicio creado sin ID:", createdService);
        throw new Error("El servicio se creó pero no tiene ID válido.");
      }

      // Map MongoDB document to local service format with all fields populated
      const localService = {
        id: createdService._id,
        nombre: mapServiceTypeToSpanish(createdService.serviceType),
        descripcion: createdService.description,
        // Calcular duración basada en scheduledStart/End si están disponibles
        duracion: (() => {
          if (createdService.scheduledStart && createdService.scheduledEnd) {
            const start = new Date(createdService.scheduledStart);
            const end = new Date(createdService.scheduledEnd);
            const calculatedDuration = Math.round((end - start) / (1000 * 60));
            console.log(
              `Duración calculada para servicio ${createdService._id}: ${calculatedDuration} minutos`
            );
            return calculatedDuration;
          }
          return 60; // Default duration in minutes solo si no hay horarios específicos
        })(),
        color: getServiceColor(createdService.status), // Color basado en estado
        estado: mapStatusToEstado(createdService.status),
        clientName: createdService.name,
        clientEmail: createdService.email,
        clientPhone: createdService.phone,
        address: createdService.address,
        preferredDate: createdService.preferredDate || currentDate,
        scheduledStart: createdService.scheduledStart, // Mantener campos de horario
        scheduledEnd: createdService.scheduledEnd, // Mantener campos de horario
        _id: createdService._id,
        technician: createdService.technician || null, // Incluir técnico si existe
      };

      // Solo agregamos a los servicios pendientes si no tiene técnico asignado
      // Esto asegura que los servicios creados desde el calendario (que tienen técnico)
      // no aparezcan en la barra lateral
      if (!createdService.technician) {
        const serviciosActualizados = [...serviciosPendientes, localService];
        setServiciosPendientes(serviciosActualizados);
      }

      // También actualizamos los servicios para que se refleje inmediatamente
      setLocalServices((prev) => [...prev, createdService]);

      // Forzar refresco del listado de servicios
      await getAllServices(true);

      return createdService;
    } catch (error) {
      console.error("Error al crear servicio:", error);
      mostrarAlerta({
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

    // Verificar solapamientos antes de permitir el drop
    const newStart = new Date(event.start);
    const newEnd = new Date(event.end);
    const newResourceId = event.getResources()[0]?.id;

    // Buscar conflictos con otros eventos
    const conflicto = eventos.find((otroEvento) => {
      if (otroEvento.id === event.id) return false; // Ignorar el evento actual
      if (otroEvento.resourceId !== newResourceId) return false; // Solo verificar mismo técnico

      const otroInicio = new Date(otroEvento.start);
      const otroFin = new Date(otroEvento.end);

      return (
        (newStart >= otroInicio && newStart < otroFin) ||
        (newEnd > otroInicio && newEnd <= otroFin) ||
        (newStart <= otroInicio && newEnd >= otroFin)
      );
    });

    if (conflicto) {
      mostrarAlerta({
        icon: "error",
        title: "Conflicto de Horario",
        text: "No se puede mover el servicio a ese horario porque ya existe otro servicio",
        confirmButtonColor: "#e74c3c",
      });
      info.revert(); // Revertir el movimiento
      return;
    }

    const tecnicoDestino = tecnicos.find((t) => t.id === newResourceId);

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

  // Agregar el evento contextmenu específicamente a los elementos de nombre de técnico
  useEffect(() => {
    let isSetupRunning = false; // Bandera para prevenir ejecuciones múltiples

    const setupContextMenus = () => {
      if (isSetupRunning) return; // Si ya se está ejecutando, salir
      isSetupRunning = true;

      try {
        // Buscar específicamente los elementos de label de técnico clickeables
        const tecnicoLabels = document.querySelectorAll(
          ".tecnico-label-clickable"
        );

        console.log(
          "Configurando menús contextuales para",
          tecnicoLabels.length,
          "técnicos"
        );

        tecnicoLabels.forEach((element) => {
          // Verificar si ya tiene el event listener configurado
          if (element.hasAttribute("data-context-menu-setup")) {
            return; // Ya está configurado, no hacer nada
          }

          // Marcar como configurado
          element.setAttribute("data-context-menu-setup", "true");

          // Agregar el event listener solo al área del nombre del técnico
          element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const tecnicoId = element.getAttribute("data-resource-id");
            const tecnico = tecnicos.find((t) => t.id === tecnicoId);

            console.log(
              "Menu contextual activado para técnico:",
              tecnico?.title
            );

            if (tecnico) {
              showContextMenu(e, tecnico);
            }
          });
        });
      } finally {
        isSetupRunning = false; // Resetear la bandera
      }
    };

    // Configurar los menús después de un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(setupContextMenus, 100);

    // También configurar cuando cambie la vista del calendario
    const observer = new MutationObserver((mutations) => {
      let shouldSetup = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Verificar si se agregaron elementos de técnico NUEVOS (sin nuestro atributo)
          const addedResourceLabels = Array.from(mutation.addedNodes).some(
            (node) => {
              if (node.nodeType === 1) {
                // Verificar si el nodo o sus hijos contienen elementos de técnico sin configurar
                const hasUnconfiguredLabels =
                  node.classList?.contains("tecnico-label-clickable") &&
                  !node.hasAttribute("data-context-menu-setup");
                const hasUnconfiguredChildren = node.querySelector?.(
                  ".tecnico-label-clickable:not([data-context-menu-setup])"
                );

                return hasUnconfiguredLabels || hasUnconfiguredChildren;
              }
              return false;
            }
          );

          if (addedResourceLabels) {
            shouldSetup = true;
          }
        }
      });

      // Solo ejecutar setup si realmente hay elementos nuevos que configurar
      if (shouldSetup && !isSetupRunning) {
        setTimeout(setupContextMenus, 50);
      }
    });

    // Observar cambios en el contenedor del calendario
    const calendarContainer = document.querySelector("#calendario");
    if (calendarContainer) {
      observer.observe(calendarContainer, {
        childList: true,
        subtree: true,
      });

      // Prevenir menú contextual en todo el calendario excepto en nombres de técnicos
      const handleCalendarContextMenu = (e) => {
        // Solo permitir menú contextual si el elemento clickeado es un nombre de técnico
        const isTecnicoLabel = e.target.closest(".tecnico-label-clickable");
        if (!isTecnicoLabel) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      calendarContainer.addEventListener(
        "contextmenu",
        handleCalendarContextMenu
      );

      // Cleanup function mejorada
      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
        calendarContainer.removeEventListener(
          "contextmenu",
          handleCalendarContextMenu
        );
      };
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [tecnicos]);
  // Contenido personalizado para las etiquetas de recursos
  const resourceLabelContent = useCallback((arg) => {
    // Obtener el nombre completo y dividirlo en palabras
    const fullName = arg.resource.title;
    const names = fullName.split(" ");

    // Obtener las iniciales de cada palabra
    const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");

    return {
      html: `<div class="resource-label tecnico-label-clickable" 
              style="cursor: context-menu; padding: 8px; border-radius: 4px; transition: background-color 0.2s;" 
              data-resource-id="${arg.resource.id}" 
              title="Clic derecho para opciones del técnico: ${fullName}"
              onmouseenter="this.style.backgroundColor='rgba(135, 201, 71, 0.1)'"
              onmouseleave="this.style.backgroundColor='transparent'">
              <div class="tecnico-nombre">
                <span class="tecnico-initials">${initials}</span>
              </div>
          </div>`,
    };
  }, []);

  const handleDateSelect = async (selectInfo) => {
    console.log("📅 handleDateSelect disparado:", selectInfo);

    const tecnico = tecnicos.find((t) => t.id === selectInfo.resource.id);
    const fechaInicio = new Date(selectInfo.start);
    const fechaFin = new Date(selectInfo.end);

    // Calcular duración en minutos
    const duracionMinutos = (fechaFin - fechaInicio) / (1000 * 60);

    console.log("Selección de tiempo en calendario:", {
      inicio: fechaInicio.toLocaleString(),
      fin: fechaFin.toLocaleString(),
      duracionMinutos: duracionMinutos,
    });

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
      facturado: {
        nombre: "Facturado",
        color: "#7f8c8d",
        icon: "fa-file-invoice-dollar",
        gradient: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
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
      title: "Nuevo Servicio",
      html: `
      <div id="servicioForm">
        <div class="form-row">
          <div class="input-group">
            <label>Tipo de servicio</label>
            <select id="nombre" class="form-field">
              <option value="">Seleccionar tipo de servicio...</option>
              <option value="pest-control">Control de Plagas</option>
              <option value="gardening">Jardinería</option>
              <option value="residential-fumigation">Fumigación Residencial</option>
              <option value="commercial-fumigation">Fumigación Comercial</option>
              <option value="custom">Otro</option>
            </select>
          </div>
          <div class="input-group">
            <label id="clientNameLabel">Cliente</label>
            <input type="text" id="clientName" class="form-field" placeholder="Nombre del cliente">
          </div>
        </div>
        
        <div class="form-row">
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="clientEmail" class="form-field" placeholder="correo@ejemplo.com">
          </div>
          <div class="input-group">
            <label>Teléfono</label>
            <input type="tel" id="clientPhone" class="form-field" placeholder="Teléfono de contacto">
          </div>
        </div>
        
        <div class="form-row">
          <div class="input-group">
            <label>Municipio</label>
            <input type="text" id="municipality" class="form-field" placeholder="Municipio">
          </div>
          <div class="input-group">
            <label>Barrio</label>
            <input type="text" id="neighborhood" class="form-field" placeholder="Barrio o sector">
          </div>
        </div>
        
        <div class="form-row">
          <div class="input-group">
            <label>Dirección</label>
            <input type="text" id="streetAddress" class="form-field" placeholder="Calle/Carrera, número">
          </div>
          <div class="input-group">
            <label>Especificaciones</label>
            <input type="text" id="addressDetails" class="form-field" placeholder="Apto/Casa/Empresa/Referencias">
          </div>
        </div>
        
        <div class="form-row description-row">
          <div class="input-group full-width">
            <label>Descripción</label>
            <textarea id="descripcion" class="form-field" placeholder="Descripción detallada del servicio" rows="3"></textarea>
          </div>
        </div>
        
        <div class="form-row mt-2">
          <div class="input-group full-width">
            <label>Estado del servicio</label>
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
        </div>
        
        <div class="form-row tech-info">
          <div class="input-group full-width">
            <div class="tech-details-card">
              <div class="tech-header">
                <i class="fas fa-info-circle"></i>
                <span>Información de Servicio</span>
              </div>
              <div class="tech-details-content">
                <div class="tech-detail-item">
                  <i class="fas fa-user"></i>
                  <span>Técnico: <strong>${tecnico.title}</strong></span>
                </div>
                <div class="tech-time-row">
                  <div class="tech-detail-item time-item">
                    <i class="fas fa-clock"></i>
                    <span>Inicio: <strong>${fechaInicio
                      .toLocaleTimeString()
                      .replace(/(:\d{2}):\d{2}$/, "$1")}</strong></span>
                  </div>
                  <div class="tech-detail-item time-item time-end">
                    <i class="fas fa-hourglass-end"></i>
                    <span>Fin: <strong>${fechaFin
                      .toLocaleTimeString()
                      .replace(/(:\d{2}):\d{2}$/, "$1")}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style>
          #servicioForm {
            padding: 15px 15px 5px 15px;
            background-color: #2d3748;
            border-radius: 10px;
            width: 600px;
            max-width: 600px;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .form-row {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            width: 100%;
            gap: 20px;
            box-sizing: border-box;
          }
          
          .input-group {
            display: flex;
            flex-direction: column;
            width: 270px;
            max-width: 270px;
            min-width: 270px;
            box-sizing: border-box;
          }
          
          .input-group.full-width {
            width: 100%;
            max-width: 100%;
            min-width: 100%;
          }
          
          .input-group label {
            color: #87c947;
            font-weight: 500;
            margin-bottom: 8px;
            display: block;
            font-size: 14px;
          }
          
          .form-field {
            padding: 10px 12px;
            border: 1px solid #4a5568;
            border-radius: 6px;
            background-color: #1a202c;
            color: white;
            width: 100%;
            height: 40px;
            box-sizing: border-box;
            font-size: 14px;
            min-height: 40px;
            text-align: left;
          }
          
          .form-field::placeholder {
            color: #718096;
          }
          
          .form-field:focus {
            border-color: #87c947;
            outline: none;
            box-shadow: 0 0 0 1px #87c947;
          }
          
          textarea.form-field {
            height: auto;
            min-height: 80px;
            resize: vertical;
            width: 100%;
            max-width: 100%;
            min-width: 100%;
            padding: 12px;
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
          }
          
          /* Específicamente para el textarea de descripción */
          .description-row textarea.form-field {
            width: 100%;
            max-width: 560px;
          }
          
          /* Estilos para los botones de estado */
          #estadosContainer {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
            justify-content: center;
          }
          
          .estado-btn {
            padding: 8px 15px;
            border-radius: 6px;
            border: none;
            color: white;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.6;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .estado-btn i {
            font-size: 14px;
          }
          
          .estado-btn.active {
            opacity: 1;
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          /* Ajustes para el espaciado */
          #servicioForm .form-row:last-of-type {
            margin-bottom: 5px;
          }
          
          .tech-info {
            margin-top: 0;
            margin-bottom: 10px;
          }
          
          /* Tarjeta con detalles del técnico y horario */
          .tech-details-card {
            width: 100%;
            background-color: #1a202c;
            border-radius: 8px;
            border-left: 4px solid #87c947;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            margin-top: 0;
            margin-bottom: 0;
          }
          
          .tech-header {
            background-color: #22252f;
            padding: 10px 15px;
            color: #87c947;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #2d3748;
            border-left: 4px solid #87c947;
            margin-left: -4px;
          }
          
          .tech-details-content {
            padding: 10px 15px;
          }
          
          .tech-detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #a0aec0;
            margin-bottom: 6px;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .tech-detail-item:last-child {
            margin-bottom: 0;
          }
          
          .tech-detail-item i {
            color: #87c947;
            width: 16px;
            text-align: center;
          }
          
          .tech-detail-item strong {
            color: #e2e8f0;
            font-weight: 500;
          }
          
          .tech-time-row {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 30px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #2d3748;
          }
          
          .tech-detail-item.time-item {
            margin-bottom: 0;
          }
          
          .tech-detail-item.time-end {
            margin-left: 20px;
          }
          
          @media (max-width: 576px) {
            .tech-time-row {
              flex-direction: column;
              gap: 6px;
            }
            
            .tech-detail-item.time-item {
              margin-bottom: 6px;
            }
          }
          
          /* Estilos para la fila de descripción */
          .description-row {
            padding: 0 15px;
            box-sizing: border-box;
            justify-content: center;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .description-row .input-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
          }
          
          .description-row .input-group label {
            align-self: flex-start;
            width: 100%;
          }
          
          .mt-2 {
            margin-top: 10px;
          }
          
          /* Asegurar que todos los inputs tienen exactamente el mismo tamaño visual */
          select.form-field, input.form-field {
            min-width: 100%;
            max-width: 100%;
            width: 100%;
          }
        </style>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "GUARDAR",
      cancelButtonText: "CANCELAR",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#383a46",
      background: "#1e1e2f",
      color: "#ffffff",
      buttonsStyling: true,
      confirmButtonAriaLabel: "Guardar servicio",
      cancelButtonAriaLabel: "Cancelar",
      // borderRadius eliminado porque no es válido en SweetAlert2
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-button swal2-styled",
        cancelButton: "swal2-cancel-button swal2-styled",
        htmlContainer: "swal2-html-custom",
        actions: "swal2-actions-custom",
      },
      didOpen: () => {
        // Añadir estilos adicionales al modal
        const style = document.createElement("style");
        style.innerHTML = `
          .swal2-popup {
            width: 660px !important;
            padding: 1.5rem;
            box-sizing: border-box;
            background-color: #1e1e2f !important;
            border-radius: 15px !important;
            max-width: 95vw;
          }
          .swal2-title {
            font-size: 1.8rem !important;
            margin-bottom: 1.5rem !important;
            color: white !important;
          }
          .swal2-html-container {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .swal2-actions {
            margin-top: 1.5rem !important;
            gap: 20px !important;
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .swal2-actions-custom {
            width: 100% !important;
            max-width: 520px !important;
            margin: 0 auto !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          .swal2-confirm-button {
            flex: 1 !important; 
            width: 230px !important;
            min-width: 230px !important;
            max-width: 230px !important;
            padding: 0.8rem 1rem !important;
            font-weight: 600 !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 8px rgba(135, 201, 71, 0.2) !important;
          }
          .swal2-cancel-button {
            flex: 1 !important;
            width: 230px !important;
            min-width: 230px !important;
            max-width: 230px !important;
            padding: 0.8rem 1rem !important;
            font-weight: 600 !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
            border-radius: 10px !important;
            color: #e2e8f0 !important;
            background-color: #383a46 !important;
          }
          .swal2-confirm {
            border-radius: 10px !important;
            overflow: hidden !important;
          }
          button.swal2-confirm {
            border-radius: 10px !important;
          }
          .swal2-styled.swal2-confirm {
            border-radius: 10px !important;
          }
          .swal2-confirm *, .swal2-confirm.swal2-styled, .swal2-confirm.swal2-styled * {
            border-radius: 10px !important;
          }
        `;
        document.head.appendChild(style);

        // Manejar el select de tipo de servicio para cambiar la etiqueta del campo cliente
        const selectTipoServicio = document.getElementById("nombre");
        const clientNameLabel = document.getElementById("clientNameLabel");
        const clientNameInput = document.getElementById("clientName");

        selectTipoServicio.addEventListener("change", function () {
          if (this.value === "custom") {
            clientNameLabel.textContent = "Nombre del servicio";
            clientNameInput.placeholder =
              "Ej: Almuerzo, Cita médica, Reunión, etc.";
          } else {
            clientNameLabel.textContent = "Cliente";
            clientNameInput.placeholder = "Nombre del cliente";
          }
        });

        // Manejar los botones de estado
        const btns = Swal.getPopup().querySelectorAll(".estado-btn");

        // Preseleccionar "pendiente" como estado por defecto
        const pendienteBtn = [...btns].find(
          (btn) => btn.dataset.estado === "pendiente"
        );
        if (pendienteBtn) {
          pendienteBtn.style.opacity = "1";
          pendienteBtn.classList.add("active");
          document.getElementById("estadoServicio").value = "pendiente";
        }

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
        const nombre = document.getElementById("nombre").value;
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const municipality = document.getElementById("municipality").value;
        const neighborhood = document.getElementById("neighborhood").value;
        const streetAddress = document.getElementById("streetAddress").value;
        const addressDetails =
          document.getElementById("addressDetails").value || "";
        const descripcion = document.getElementById("descripcion").value;
        const estado = document.getElementById("estadoServicio").value;

        // Validar campo de cliente/servicio si se seleccionó "Otro"
        if (nombre === "custom" && (!clientName || !clientName.trim())) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre del servicio personalizado",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        // Construir dirección completa solo con los campos que tienen valor
        const addressParts = [
          municipality,
          neighborhood,
          streetAddress,
          addressDetails,
        ]
          .filter((part) => part && part.trim())
          .join(", ");
        const address = addressParts || "";

        // Validación mínima: solo verificar que tenga estado seleccionado
        // La descripción ya no es obligatoria

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

        const serviceTypes = {
          "pest-control": "Control de Plagas",
          gardening: "Jardinería",
          "residential-fumigation": "Fumigación Residencial",
          "commercial-fumigation": "Fumigación Comercial",
        };

        // Determinar el tipo de servicio y nombre
        let finalServiceType = nombre;
        let finalServiceName = serviceTypes[nombre] || nombre;
        let finalClientName = clientName;

        if (nombre === "custom") {
          // Cuando es "custom", usar el clientName como el nombre del servicio
          finalServiceType = clientName.trim();
          finalServiceName = clientName.trim();
          finalClientName = ""; // Limpiar el clientName ya que se usa para el servicio
        }

        return {
          nombre: finalServiceName, // Nombre en español para mostrar
          serviceType: finalServiceType, // Valor para el backend
          descripcion,
          clientName: finalClientName, // Cliente vacío si es servicio personalizado
          clientEmail,
          clientPhone,
          municipality,
          neighborhood,
          streetAddress,
          addressDetails,
          address,
          estado,
          color: estadosServicio[estado].color,
          isCustomService: nombre === "custom", // Flag para identificar servicios personalizados
        };
      },
    });

    if (formValues) {
      try {
        const calendarApi = selectInfo.view.calendar;
        calendarApi.unselect();

        // Usar la fecha y hora seleccionada directamente del selectInfo
        const start = new Date(selectInfo.start);
        const end = new Date(selectInfo.end);

        // Debug: Verificar que las fechas se mantienen correctas
        console.log("🕐 DEPURACIÓN DE FECHAS:");
        console.log("selectInfo.start original:", selectInfo.start);
        console.log("selectInfo.end original:", selectInfo.end);
        console.log("start procesada:", start.toLocaleString());
        console.log("end procesada:", end.toLocaleString());
        console.log(
          "Duración calculada (minutos):",
          (end - start) / (1000 * 60)
        );
        console.log("start.toISOString():", start.toISOString());
        console.log("end.toISOString():", end.toISOString());

        // VERIFICACIÓN CRÍTICA: Asegurar que end > start
        if (end <= start) {
          console.error(
            "❌ ERROR: Fecha de fin debe ser posterior a fecha de inicio"
          );
          mostrarAlerta({
            icon: "error",
            title: "Error de Fechas",
            text: "La fecha de fin debe ser posterior a la fecha de inicio. Seleccione un rango de tiempo válido.",
            confirmButtonColor: "#e74c3c",
          });
          return;
        }

        // Determinar el color de fondo y el color de texto
        const bgColor = formValues.color;
        const txtColor = "white";

        // Crear un nuevo objeto con los datos del servicio
        // Asegurar que los campos requeridos por el backend tengan valores válidos
        const nuevoServicio = {
          name: formValues.isCustomService
            ? formValues.serviceType // Para servicios personalizados, usar el nombre del servicio
            : formValues.clientName || "Cliente no especificado", // Para servicios normales, usar el cliente
          email: formValues.clientEmail || "no-email@ejemplo.com", // Backend requiere 'email'
          phone: formValues.clientPhone || "No especificado", // Backend requiere 'phone'
          address: formValues.address || "Dirección no especificada", // Backend requiere 'address'
          municipality: formValues.municipality || "",
          neighborhood: formValues.neighborhood || "",
          streetAddress: formValues.streetAddress || "",
          addressDetails: formValues.addressDetails || "",
          serviceType: formValues.serviceType || "general", // Backend requiere 'serviceType'
          description: formValues.descripcion || "Evento sin descripción", // Proporcionar descripción por defecto si está vacía
          document: formValues.clientPhone || "N/A", // Usar teléfono si está disponible, si no "N/A"
          preferredDate: start.toISOString(), // Backend requiere 'preferredDate'
          scheduledStart: start.toISOString(), // Agregar hora de inicio específica
          scheduledEnd: end.toISOString(), // Agregar hora de fin específica
          isFromCalendar: true, // Indicar que viene del calendario para asignarlo directamente
          technicianId: selectInfo.resource.id, // Incluir el ID del técnico seleccionado
          estado: formValues.estado, // Estado en español para UI
          status: mapEstadoToStatus(formValues.estado), // Mapear estado a inglés para backend
        };

        // Debug: Log detallado de los datos del servicio
        console.log("=== DATOS DEL SERVICIO A ENVIAR ===");
        console.log("Objeto completo nuevoServicio:", nuevoServicio);
        console.log("scheduledStart:", nuevoServicio.scheduledStart);
        console.log("scheduledEnd:", nuevoServicio.scheduledEnd);
        console.log(
          "Duración calculada (minutos):",
          (end - start) / (1000 * 60)
        );
        console.log("=== FIN DEBUG SERVICIO ===");

        // Guardar el servicio en la base de datos
        const createdService = await handleAgregarServicio(nuevoServicio);

        // Crear evento con la clase correcta para el estado y el ID del servicio creado
        // Construir un título dinámico basado en los campos disponibles
        let eventTitle = "";
        if (formValues.serviceType) {
          if (formValues.isCustomService) {
            // Para servicios personalizados, usar solo el nombre del servicio
            eventTitle = formValues.serviceType;
          } else {
            // Para servicios predefinidos, usar tipo + cliente si existe
            eventTitle = mapServiceTypeToSpanish(formValues.serviceType);
            if (formValues.clientName) {
              eventTitle += ` - ${formValues.clientName}`;
            }
          }
        } else if (formValues.clientName) {
          // Si no hay tipo de servicio pero sí cliente, usar solo el cliente
          eventTitle = formValues.clientName;
        } else {
          // Si no hay información específica, usar un título genérico con la hora
          const timeString = start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          eventTitle =
            formValues.descripcion &&
            formValues.descripcion.trim() &&
            formValues.descripcion !== "Evento sin descripción"
              ? formValues.descripcion.length > 30
                ? formValues.descripcion.substring(0, 30) + "..."
                : formValues.descripcion
              : `Evento ${timeString}`;
        }

        // Asegurarnos de que las fechas estén en formato ISO para evitar problemas de serialización
        const startISO = start.toISOString();
        const endISO = end.toISOString();

        // Calculamos la duración exacta para mostrarla en la consola
        const duracionMinutos = Math.round((end - start) / (1000 * 60));
        console.log("📊 FECHAS ISO PARA EVENTO:");
        console.log("startISO:", startISO);
        console.log("endISO:", endISO);
        console.log("Duración del evento:", duracionMinutos, "minutos");

        // Agregar logs adicionales para verificar que las fechas ISO sean correctas
        console.log("🚀 CREANDO EVENTO CON FECHAS ESPECÍFICAS:");
        console.log("startISO final:", startISO);
        console.log("endISO final:", endISO);
        console.log(
          "Diferencia en milisegundos:",
          new Date(endISO) - new Date(startISO)
        );
        console.log(
          "Duración en minutos:",
          Math.round((new Date(endISO) - new Date(startISO)) / (1000 * 60))
        );

        const nuevoEvento = {
          id: createdService ? createdService._id : `evento-${Date.now()}`,
          title: eventTitle,
          start: startISO,
          end: endISO, // SIEMPRE incluir fecha de fin explícita
          resourceId: selectInfo.resource.id,
          allDay: false, // Asegurar que no sea evento de día completo
          editable: true,
          durationEditable: true,
          startEditable: true,
          constraint: false, // No aplicar restricciones automáticas
          overlap: true, // Permitir que este evento específico maneje su propio solapamiento
          extendedProps: {
            descripcion: formValues.descripcion || "Sin descripción",
            estado: formValues.estado,
            clientName: formValues.clientName || "",
            clientEmail: formValues.clientEmail || "",
            clientPhone: formValues.clientPhone || "",
            address: formValues.address || "",
            municipality: formValues.municipality || "",
            neighborhood: formValues.neighborhood || "",
            streetAddress: formValues.streetAddress || "",
            addressDetails: formValues.addressDetails || "",
            serviceType: formValues.serviceType || "",
            serviceId: createdService ? createdService._id : null,
            scheduledStart: startISO, // Asegurarnos de incluir las fechas exactas
            scheduledEnd: endISO, // en los extendedProps
            duracionMinutos: duracionMinutos, // Guardar también la duración
            horaInicio: start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            horaFin: end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          },
          backgroundColor: createdService
            ? getColorByEstado(formValues.estado)
            : bgColor,
          borderColor: createdService
            ? getColorByEstado(formValues.estado)
            : bgColor,
          textColor: txtColor,
          className: `estado-${formValues.estado}`,
          display: "block",
        };

        // Debug: Log detallado del evento que se va a crear
        console.log("🎯 CREANDO EVENTO EN CALENDARIO:");
        console.log("Estado seleccionado en modal:", formValues.estado);
        console.log("Color calculado:", getColorByEstado(formValues.estado));
        console.log("nuevoEvento completo:", nuevoEvento);
        console.log("extendedProps.estado:", nuevoEvento.extendedProps.estado);
        console.log("start:", nuevoEvento.start);
        console.log("end:", nuevoEvento.end);
        console.log(
          "Duración en minutos:",
          (new Date(nuevoEvento.end) - new Date(nuevoEvento.start)) /
            (1000 * 60)
        );
        console.log(
          "scheduledStart en extendedProps:",
          nuevoEvento.extendedProps.scheduledStart
        );
        console.log(
          "scheduledEnd en extendedProps:",
          nuevoEvento.extendedProps.scheduledEnd
        );
        console.log("=== FIN DEBUG EVENTO ===");

        setEventos((prevEventos) => {
          const eventosActualizados = [...prevEventos, nuevoEvento];
          localStorage.setItem("eventos", JSON.stringify(eventosActualizados));
          return eventosActualizados;
        });

        // Crear el evento directamente en FullCalendar con configuraciones específicas
        const eventoCalendar = calendarApi.addEvent({
          id: nuevoEvento.id,
          title: nuevoEvento.title,
          start: new Date(startISO), // Usar objetos Date directamente
          end: new Date(endISO), // Usar objetos Date directamente
          resourceId: nuevoEvento.resourceId,
          allDay: false,
          editable: true,
          durationEditable: true,
          startEditable: true,
          extendedProps: nuevoEvento.extendedProps,
          backgroundColor: nuevoEvento.backgroundColor,
          borderColor: nuevoEvento.borderColor,
          textColor: nuevoEvento.textColor,
          className: nuevoEvento.className,
          display: "block",
        });

        // Log para verificar que el evento se creó con las fechas correctas
        console.log("🎯 Evento creado directamente en calendar API:", {
          id: eventoCalendar.id,
          start: eventoCalendar.start.toISOString(),
          end: eventoCalendar.end.toISOString(),
          duracionMinutos: Math.round(
            (eventoCalendar.end - eventoCalendar.start) / (1000 * 60)
          ),
        });

        // MÉTODO ALTERNATIVO: Corrección agresiva de duración
        // Usar múltiples métodos para asegurar que la duración sea correcta
        setTimeout(() => {
          // Usar el evento que acabamos de crear directamente
          if (eventoCalendar) {
            const duracionActual = Math.round(
              (eventoCalendar.end - eventoCalendar.start) / (1000 * 60)
            );
            const duracionEsperada = Math.round(
              (new Date(endISO) - new Date(startISO)) / (1000 * 60)
            );

            console.log("🔍 Verificación post-creación:", {
              duracionEsperada,
              duracionActual,
              startEsperado: startISO,
              endEsperado: endISO,
              startActual: eventoCalendar.start.toISOString(),
              endActual: eventoCalendar.end.toISOString(),
            });

            // SIEMPRE forzar las fechas correctas, sin importar si coinciden o no
            console.log("🔧 Aplicando corrección de duración obligatoria...");
            eventoCalendar.setDates(new Date(startISO), new Date(endISO));
            console.log("✅ Fechas corregidas a:", {
              nuevaStart: eventoCalendar.start.toISOString(),
              nuevaEnd: eventoCalendar.end.toISOString(),
              nuevaDuracion: Math.round(
                (eventoCalendar.end - eventoCalendar.start) / (1000 * 60)
              ),
            });
          }
        }, 50);

        // Verificación adicional después de más tiempo para asegurar persistencia
        setTimeout(() => {
          if (eventoCalendar) {
            const duracionFinal = Math.round(
              (eventoCalendar.end - eventoCalendar.start) / (1000 * 60)
            );
            console.log("🎯 Verificación final de duración:", {
              duracionFinal,
              startFinal: eventoCalendar.start.toISOString(),
              endFinal: eventoCalendar.end.toISOString(),
            });

            // Si aún no es correcto, aplicar otro intento
            if (
              duracionFinal !==
              Math.round((new Date(endISO) - new Date(startISO)) / (1000 * 60))
            ) {
              console.log("⚠️ Segundo intento de corrección...");
              eventoCalendar.setDates(new Date(startISO), new Date(endISO));
            }
          }
        }, 200);

        // Verificar que el evento se agregó correctamente
        setTimeout(() => {
          if (eventoCalendar) {
            console.log("✅ Evento agregado al calendario:");
            console.log("ID:", eventoCalendar.id);
            console.log("Título:", eventoCalendar.title);
            console.log("Start:", eventoCalendar.start);
            console.log("End:", eventoCalendar.end);
            console.log(
              "Duración real en calendario:",
              Math.round(
                (eventoCalendar.end - eventoCalendar.start) / (1000 * 60)
              ),
              "minutos"
            );
          } else {
            console.error("❌ No se pudo encontrar el evento en el calendario");
          }
        }, 300);

        mostrarAlerta({
          icon: "success",
          title: "Servicio creado",
          text: `El servicio ha sido creado y asignado a ${tecnico.title}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al crear el servicio:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo crear el servicio. Por favor, intente nuevamente.",
          confirmButtonColor: "#87c947",
        });
      }
    }
  };

  const handleEventClick = (info) => {
    // Evitar CUALQUIER propagación del evento - importante para prevenir la creación de un nuevo evento
    if (info.jsEvent) {
      info.jsEvent.preventDefault();
      info.jsEvent.stopPropagation();
      info.jsEvent.stopImmediatePropagation();
    }

    console.log("🔥 handleEventClick ejecutado:", info.event);

    const evento = info.event;
    // Obtener el resourceId de manera segura
    const resourceId =
      evento.resourceId ||
      (evento.getResources && evento.getResources()[0]?.id);
    const tecnico = tecnicos.find((t) => t.id === resourceId);
    const fechaInicio = new Date(evento.start);
    const fechaFin = new Date(evento.end);

    console.log("📊 Datos del evento:", {
      title: evento.title,
      tecnico: tecnico?.title,
      extendedProps: evento.extendedProps,
    });

    // Modal simple y claro con las opciones principales
    mostrarAlerta({
      title: `📋 ${evento.title}`,
      html: `
      <div class="evento-detalles">
        <div class="detalle-info">
          <div class="info-item">
            <strong>👤 Técnico:</strong> ${tecnico?.title || "Sin asignar"}
          </div>
          <div class="info-item">
            <strong>🕐 Inicio:</strong> ${fechaInicio.toLocaleDateString()} ${fechaInicio.toLocaleTimeString()}
          </div>
          <div class="info-item">
            <strong>🕐 Fin:</strong> ${fechaFin.toLocaleDateString()} ${fechaFin.toLocaleTimeString()}
          </div>
          <div class="info-item">
            <strong>📝 Descripción:</strong> ${
              evento.extendedProps.descripcion || "Sin descripción"
            }
          </div>
        </div>
        <div class="opciones-evento">
          <h4>¿Qué deseas hacer con este servicio?</h4>
        </div>
      </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i> Editar',
      denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
      cancelButtonText: '<i class="fas fa-times"></i> Cerrar',
      confirmButtonColor: "#3085d6",
      denyButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      footer: `
        <button type="button" class="swal2-styled" id="moverBtn" style="background-color: #f39c12; border: none; margin: 0 5px;">
          <i class="fas fa-arrows-alt"></i> Mover Servicio
        </button>
      `,
      customClass: {
        popup: "evento-modal",
        actions: "evento-actions",
        confirmButton: "btn-editar",
        denyButton: "btn-eliminar",
        cancelButton: "btn-cerrar",
      },
      didOpen: () => {
        // Agregar evento al botón mover
        const moverBtn = document.getElementById("moverBtn");
        if (moverBtn) {
          moverBtn.addEventListener("click", () => {
            Swal.close();
            handleMoverServicio(evento);
          });
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Editar servicio
        console.log("🖊️ Editando servicio:", evento);
        handleEditarServicio(evento);
      } else if (result.isDenied) {
        // Eliminar servicio
        console.log("🗑️ Eliminando servicio:", evento);
        handleEliminarServicioCalendario(evento);
      }
      // Si se cancela, simplemente se cierra el modal
    });
  };

  const handleEditarServicio = async (servicioId, datosActualizados) => {
    // Si se pasa un evento del calendario (objeto con propiedades de FullCalendar)
    if (servicioId && typeof servicioId === "object" && servicioId.start) {
      const evento = servicioId;
      // Obtener el resourceId de manera segura
      const resourceId =
        evento.resourceId ||
        (evento.getResources && evento.getResources()[0]?.id);
      const tecnico = tecnicos.find((t) => t.id === resourceId);
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
        facturado: {
          nombre: "Facturado",
          color: "#7f8c8d",
          icon: "fa-file-invoice-dollar",
          gradient: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
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
    }
    // Si se pasa un ID de servicio (para servicios de la barra lateral)
    else if (servicioId && datosActualizados) {
      try {
        console.log("Editando servicio de la barra lateral:", {
          servicioId,
          datosActualizados,
        });
        // Actualizar el servicio en el backend
        const servicioActualizado = await serviceService.updateService(
          servicioId,
          datosActualizados
        );
        // Actualizar el estado local
        setServiciosPendientes((prevServicios) =>
          prevServicios.map((servicio) =>
            servicio.id === servicioId || servicio._id === servicioId
              ? { ...servicio, ...datosActualizados }
              : servicio
          )
        );
        // También actualizar en el calendario si existe
        setEventos((prevEventos) =>
          prevEventos.map((evento) =>
            evento.id === servicioId || evento._id === servicioId
              ? {
                  ...evento,
                  title:
                    datosActualizados.nombre ||
                    datosActualizados.serviceType ||
                    evento.title,
                  extendedProps: {
                    ...evento.extendedProps,
                    descripcion:
                      datosActualizados.descripcion ||
                      evento.extendedProps?.descripcion,
                    clientName:
                      datosActualizados.clientName ||
                      evento.extendedProps?.clientName,
                    clientEmail:
                      datosActualizados.clientEmail ||
                      evento.extendedProps?.clientEmail,
                    clientPhone:
                      datosActualizados.clientPhone ||
                      evento.extendedProps?.clientPhone,
                    address:
                      datosActualizados.address ||
                      evento.extendedProps?.address,
                  },
                }
              : evento
          )
        );
        console.log("Servicio actualizado exitosamente:", servicioActualizado);
        return servicioActualizado;
      } catch (error) {
        console.error("Error al actualizar servicio:", error);
        throw error;
      }
    }
  };

  const handleMoverServicio = async (evento) => {
    // Obtener el resourceId actual
    const resourceIdActual =
      evento.resourceId ||
      (evento.getResources && evento.getResources()[0]?.id);

    // Crear opciones de técnicos
    const opcionesTecnicos = tecnicos
      .map(
        (tecnico) =>
          `<option value="${tecnico.id}" ${
            tecnico.id === resourceIdActual ? "selected" : ""
          }>
        ${tecnico.title}
      </option>`
      )
      .join("");

    const { value: formValues } = await mostrarAlerta({
      title: "Mover Servicio",
      html: `
        <div class="move-service-form">
          <div class="mb-3">
            <label class="form-label">Técnico de destino:</label>
            <select id="nuevoTecnico" class="form-control">
              ${opcionesTecnicos}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Nueva fecha y hora de inicio:</label>
            <input type="datetime-local" id="nuevaFecha" class="form-control" 
                   value="${new Date(evento.start)
                     .toISOString()
                     .slice(0, 16)}" />
          </div>
          <div class="mb-3">
            <label class="form-label">Duración (minutos):</label>
            <input type="number" id="duracion" class="form-control" 
                   value="${Math.round(
                     (new Date(evento.end) - new Date(evento.start)) /
                       (1000 * 60)
                   )}" 
                   min="15" step="15" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Mover Servicio",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f39c12",
      preConfirm: () => {
        const nuevoTecnico = document.getElementById("nuevoTecnico").value;
        const nuevaFecha = document.getElementById("nuevaFecha").value;
        const duracion = parseInt(document.getElementById("duracion").value);

        if (!nuevoTecnico || !nuevaFecha || !duracion) {
          Swal.showValidationMessage("Por favor complete todos los campos");
          return false;
        }

        return { nuevoTecnico, nuevaFecha, duracion };
      },
    });

    if (formValues) {
      try {
        const nuevaFechaInicio = new Date(formValues.nuevaFecha);
        const nuevaFechaFin = new Date(
          nuevaFechaInicio.getTime() + formValues.duracion * 60 * 1000
        );

        // Verificar conflictos en el nuevo horario
        const conflicto = eventos.find((otroEvento) => {
          if (otroEvento.id === evento.id) return false; // Ignorar el evento actual
          if (otroEvento.resourceId !== formValues.nuevoTecnico) return false; // Solo verificar mismo técnico

          const otroInicio = new Date(otroEvento.start);
          const otroFin = new Date(otroEvento.end);

          return (
            (nuevaFechaInicio >= otroInicio && nuevaFechaInicio < otroFin) ||
            (nuevaFechaFin > otroInicio && nuevaFechaFin <= otroFin) ||
            (nuevaFechaInicio <= otroInicio && nuevaFechaFin >= otroFin)
          );
        });

        if (conflicto) {
          mostrarAlerta({
            icon: "error",
            title: "Conflicto de Horario",
            text: "Ya existe un servicio en ese horario para el técnico seleccionado",
            confirmButtonColor: "#e74c3c",
          });
          return;
        }

        // Actualizar el evento
        evento.setProp("start", nuevaFechaInicio);
        evento.setProp("end", nuevaFechaFin);

        // Si cambió el técnico, mover el evento al nuevo recurso
        if (formValues.nuevoTecnico !== resourceIdActual) {
          evento.remove();

          // Crear nuevo evento con el nuevo técnico
          const nuevoEvento = {
            id: evento.id,
            title: evento.title,
            start: nuevaFechaInicio,
            end: nuevaFechaFin,
            resourceId: formValues.nuevoTecnico,
            backgroundColor: evento.backgroundColor,
            borderColor: evento.borderColor,
            textColor: evento.textColor,
            extendedProps: evento.extendedProps,
          };

          const calendarApi = calendarRef.current?.getApi();
          if (calendarApi) {
            calendarApi.addEvent(nuevoEvento);
          }
        }

        // Actualizar el estado local
        setEventos((prevEventos) =>
          prevEventos.map((ev) =>
            ev.id === evento.id
              ? {
                  ...ev,
                  start: nuevaFechaInicio.toISOString(),
                  end: nuevaFechaFin.toISOString(),
                  resourceId: formValues.nuevoTecnico,
                }
              : ev
          )
        );

        mostrarAlerta({
          icon: "success",
          title: "Servicio Movido",
          text: "El servicio ha sido movido exitosamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al mover servicio:", error);
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo mover el servicio. Intente nuevamente.",
          confirmButtonColor: "#e74c3c",
        });
      }
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
  const handleAsignarServicio = async (
    eventoCalendario,
    servicioId,
    technicianIds = [],
    skipRefresh = false // Nuevo parámetro para evitar refresh automático
  ) => {
    try {
      console.log("Iniciando asignación de servicio con parámetros:", {
        eventoCalendario,
        servicioId,
        technicianIds,
      });

      // Log explícitamente las fechas que estamos recibiendo
      console.log("Fechas recibidas:", {
        start: eventoCalendario.start,
        end: eventoCalendario.end,
        startDate: new Date(eventoCalendario.start),
        endDate: new Date(eventoCalendario.end),
        extendedProps: eventoCalendario.extendedProps,
      });

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

      // Asegurarnos de usar ISOString para las fechas y conservar la duración exacta
      let scheduledStart, scheduledEnd;

      // Primero intentamos usar las fechas de extendedProps si existen
      if (
        eventoCalendario.extendedProps?.scheduledStart &&
        eventoCalendario.extendedProps?.scheduledEnd
      ) {
        scheduledStart = eventoCalendario.extendedProps.scheduledStart;
        scheduledEnd = eventoCalendario.extendedProps.scheduledEnd;
      }
      // Si no están en extendedProps, usamos las fechas del evento
      else if (eventoCalendario.start && eventoCalendario.end) {
        // Convertir a objeto Date y luego a ISOString para asegurar el formato correcto
        const startDate = new Date(eventoCalendario.start);
        const endDate = new Date(eventoCalendario.end);

        // Verificar que las fechas son válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Fechas inválidas detectadas", {
            start: eventoCalendario.start,
            end: eventoCalendario.end,
          });
          // Usar fecha actual como fallback y agregar 1 hora para el fin
          const now = new Date();
          scheduledStart = now.toISOString();
          scheduledEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        } else {
          scheduledStart = startDate.toISOString();
          scheduledEnd = endDate.toISOString();
        }
      }
      // Si no hay fechas disponibles, usamos la fecha actual
      else {
        const now = new Date();
        scheduledStart = now.toISOString();
        scheduledEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      }

      // Calcular y verificar la duración en minutos
      const startTime = new Date(scheduledStart);
      const endTime = new Date(scheduledEnd);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

      console.log("Fechas procesadas para asignación:", {
        scheduledStart,
        scheduledEnd,
        durationMinutes,
      });

      console.log("Assigning service to calendar event:", {
        serviceId: realServiceId,
        technician: eventoCalendario.resourceId,
        technicians: technicianIds,
        start: scheduledStart,
        end: scheduledEnd,
        durationMinutes,
      });

      // Utilizar fechas específicas del evento - procesarlas adecuadamente
      // Asegurarnos de usar ISOString para las fechas y conservar la duración exacta
      let processedStart, processedEnd;

      // Primero intentamos usar las fechas de extendedProps si existen
      if (
        eventoCalendario.extendedProps?.scheduledStart &&
        eventoCalendario.extendedProps?.scheduledEnd
      ) {
        processedStart = eventoCalendario.extendedProps.scheduledStart;
        processedEnd = eventoCalendario.extendedProps.scheduledEnd;
      }
      // Si no están en extendedProps, usamos las fechas del evento
      else if (eventoCalendario.start && eventoCalendario.end) {
        // Convertir a objeto Date y luego a ISOString para asegurar el formato correcto
        const startDate = new Date(eventoCalendario.start);
        const endDate = new Date(eventoCalendario.end);

        // Verificar que las fechas son válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Fechas inválidas detectadas", {
            start: eventoCalendario.start,
            end: eventoCalendario.end,
          });
          // Usar fecha actual como fallback y agregar 1 hora para el fin
          const now = new Date();
          processedStart = now.toISOString();
          processedEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        } else {
          processedStart = startDate.toISOString();
          processedEnd = endDate.toISOString();
        }
      }
      // Si no hay fechas disponibles, usamos la fecha actual
      else {
        const now = new Date();
        processedStart = now.toISOString();
        processedEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      }

      // Calcular y verificar la duración en minutos
      const processedStartTime = new Date(processedStart);
      const processedEndTime = new Date(processedEnd);
      const processedDurationMinutes = Math.round(
        (processedEndTime - processedStartTime) / (1000 * 60)
      );

      console.log("Fechas procesadas para asignación:", {
        processedStart,
        processedEnd,
        processedDurationMinutes,
      });

      console.log("Assigning service to calendar event:", {
        serviceId: realServiceId,
        technician: eventoCalendario.resourceId,
        technicians: technicianIds,
        start: processedStart,
        end: processedEnd,
        durationMinutes: processedDurationMinutes,
      });

      // First convert the service request to a service if needed
      // This will create a new service record in the services collection
      let updatedService;
      try {
        console.log("Converting service request to service...", {
          startDate: processedStart,
          endDate: processedEnd,
        });

        const conversionResult =
          await serviceService.convertServiceRequestToService(
            realServiceId,
            eventoCalendario.resourceId,
            technicianIds, // Pasar el array de técnicos
            processedStart, // Usar fechas procesadas
            processedEnd // Usar fechas procesadas
          );

        updatedService = conversionResult.service;
        console.log("✅ Service request converted to service:", updatedService);
      } catch (conversionError) {
        console.log(
          "⚠️ Conversion failed, attempting regular update:",
          conversionError.message
        );

        // If conversion fails, fall back to the regular update
        updatedService = await serviceService.updateService(realServiceId, {
          status: "confirmed",
          technician: eventoCalendario.resourceId, // Técnico principal
          technicians: technicianIds, // Array de todos los técnicos
          scheduledStart: processedStart, // Usar fechas procesadas
          scheduledEnd: processedEnd, // Usar fechas procesadas
          preferredDate: processedStart, // Actualizar también la fecha preferida
        });
      }

      console.log("Service successfully updated:", updatedService);

      // Create a properly formatted calendar event with required properties
      // Usar siempre las fechas exactas que fueron procesadas
      const formattedEvent = {
        id: updatedService._id,
        title: `${
          eventoCalendario.title || updatedService.serviceType || "Servicio"
        } - ${
          updatedService.name ||
          eventoCalendario.extendedProps?.clientName ||
          "Cliente"
        }`,
        start: processedStart, // Usar fechas procesadas
        end: processedEnd, // Usar fechas procesadas
        resourceId: eventoCalendario.resourceId, // Usar el técnico específico para este evento
        backgroundColor: "#87c947",
        borderColor: "#87c947",
        className: "estado-confirmado",
        textColor: "white",
        display: "block",
        extendedProps: {
          estado: "confirmado",
          status: "confirmed",
          descripcion:
            updatedService.description ||
            eventoCalendario.extendedProps?.descripcion,
          description:
            updatedService.description ||
            eventoCalendario.extendedProps?.description,
          cliente:
            updatedService.name || eventoCalendario.extendedProps?.clientName,
          clientName:
            updatedService.name || eventoCalendario.extendedProps?.clientName,
          telefono:
            updatedService.phone || eventoCalendario.extendedProps?.clientPhone,
          clientPhone:
            updatedService.phone || eventoCalendario.extendedProps?.clientPhone,
          email:
            updatedService.email || eventoCalendario.extendedProps?.clientEmail,
          clientEmail:
            updatedService.email || eventoCalendario.extendedProps?.clientEmail,
          direccion:
            updatedService.address || eventoCalendario.extendedProps?.address,
          address:
            updatedService.address || eventoCalendario.extendedProps?.address,
          technicians: technicianIds, // Guardar los IDs de todos los técnicos en las props extendidas
          serviceId: updatedService._id || realServiceId,
          scheduledStart: processedStart, // Guardar también las fechas procesadas
          scheduledEnd: processedEnd, // en extendedProps
          fecha: eventoCalendario.extendedProps?.fecha, // Guardar la fecha original del modal
          duracionMinutos: processedDurationMinutes, // Incluir la duración en minutos para referencia
        },
      };

      console.log("Formatted event for calendar:", formattedEvent);

      // MÉTODO 1: Actualizar el estado React
      // Update UI state with the properly formatted event
      setEventos((prevEventos) => {
        // Remove any existing event with the same ID to avoid duplicates
        const filteredEvents = prevEventos.filter(
          (e) =>
            e.id !== formattedEvent.id ||
            e.resourceId !== formattedEvent.resourceId
        );
        return [...filteredEvents, formattedEvent];
      });

      // MÉTODO 2: Intentar agregar usando calendarRef directo
      try {
        if (calendarRef && calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          if (calendarApi) {
            console.log("Adding event directly via calendar API ref");

            // Primero eliminamos eventos existentes con el mismo ID para evitar duplicados
            const existingEvent = calendarApi.getEventById(formattedEvent.id);
            if (existingEvent) {
              console.log(
                "Removing existing event before adding new one",
                existingEvent
              );
              existingEvent.remove();
            }

            // Agregamos el nuevo evento
            calendarApi.addEvent(formattedEvent);

            // Refrescamos para asegurar que se muestre
            calendarApi.refetchEvents();

            console.log("Event added successfully via calendarRef");
          }
        }
      } catch (calendarRefError) {
        console.warn("Error using calendarRef:", calendarRefError);
      }

      // MÉTODO 3: Buscar el calendario en el DOM y usar su API
      try {
        const calendarElement = document.querySelector(".fc");
        if (calendarElement && calendarElement._fullCalendar) {
          console.log("Found FullCalendar instance in DOM");
          const calendarInstance = calendarElement._fullCalendar;
          calendarInstance.addEvent(formattedEvent);
          console.log("Event added via DOM FullCalendar instance");
        }
      } catch (domError) {
        console.warn("Error accessing calendar through DOM:", domError);
      }

      // MÉTODO 4: Usar un evento personalizado para notificar a otros componentes
      try {
        console.log("Dispatching custom event for calendar refresh");
        const customEvent = new CustomEvent("calendar-update-needed", {
          detail: {
            event: formattedEvent,
            action: "add",
            timestamp: new Date().getTime(),
          },
        });
        document.dispatchEvent(customEvent);
      } catch (customEventError) {
        console.warn("Error dispatching custom event:", customEventError);
      }

      // Siempre quitar de servicios pendientes después de asignar, sin importar cuántos técnicos
      // Esto evita que el servicio aparezca como pendiente cuando ya está asignado
      setServiciosPendientes((prevServicios) => {
        console.log("Removing from pending services:", {
          servicioId,
          realServiceId,
          currentPending: prevServicios.length,
        });
        return prevServicios.filter(
          (s) =>
            s.id !== servicioId &&
            s._id !== servicioId &&
            s.id !== updatedService._id &&
            s._id !== updatedService._id
        );
      });

      // Save events to localStorage with properly formatted event
      const currentEventos = JSON.parse(
        localStorage.getItem("eventos") || "[]"
      );
      const eventosActualizados = currentEventos.filter(
        (e) =>
          e.id !== formattedEvent.id ||
          e.resourceId !== formattedEvent.resourceId
      );
      eventosActualizados.push(formattedEvent);
      localStorage.setItem("eventos", JSON.stringify(eventosActualizados));
      console.log("Updated localStorage events:", {
        before: currentEventos.length,
        after: eventosActualizados.length,
      });

      // Update cached services to ensure persistence between page reloads
      const cachedServices = localStorage.getItem("cachedServices");
      if (cachedServices) {
        try {
          const parsedServices = JSON.parse(cachedServices);
          // Buscar el servicio por ID y actualizarlo o agregarlo si no existe
          let serviceUpdated = false;
          const updatedCache = parsedServices.map((service) => {
            if (
              service._id === realServiceId ||
              service._id === updatedService._id
            ) {
              serviceUpdated = true;
              return updatedService;
            }
            return service;
          });

          // Si no se actualizó ningún servicio, agregar el nuevo
          if (!serviceUpdated) {
            updatedCache.push(updatedService);
          }

          localStorage.setItem("cachedServices", JSON.stringify(updatedCache));
          console.log("Cache updated after service assignment");
        } catch (cacheError) {
          console.error("Error updating service cache:", cacheError);
        }
      }

      // También eliminar el servicio de la lista pendiente en localStorage
      try {
        const localPendingServices = JSON.parse(
          localStorage.getItem("serviciosPendientes") || "[]"
        );
        const filteredLocalPending = localPendingServices.filter(
          (s) =>
            s.id !== servicioId &&
            s._id !== realServiceId &&
            s.id !== updatedService._id &&
            s._id !== updatedService._id
        );
        localStorage.setItem(
          "serviciosPendientes",
          JSON.stringify(filteredLocalPending)
        );
        console.log("Updated local pending services storage", {
          before: localPendingServices.length,
          after: filteredLocalPending.length,
        });
      } catch (localStorageError) {
        console.error(
          "Error updating localStorage pending services:",
          localStorageError
        );
      }

      // Forzar un refresco del calendario
      document.dispatchEvent(
        new CustomEvent("calendar-update-needed", {
          detail: { event: formattedEvent },
        })
      );

      // Force a refresh of service data in the background only if not skipping
      if (!skipRefresh && typeof getAllServices === "function") {
        getAllServices(true);
      } else if (skipRefresh) {
        console.log(
          "Skipping automatic refresh to preserve local event timing"
        );
      } else {
        console.warn("getAllServices function not available for refresh");
      }

      return updatedService; // Retornar el servicio actualizado para que lo pueda usar el drag & drop
    } catch (error) {
      console.error("Error al asignar servicio:", error);
      mostrarAlerta({
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

    return rawEvents
      .filter((event) => {
        if (!event) {
          console.warn("Found null or undefined event");
          return false;
        }
        // Check for required properties
        const hasTitle = event.title && typeof event.title === "string";
        const hasStart =
          event.start &&
          (event.start instanceof Date || typeof event.start === "string");
        if (!hasTitle || !hasStart) {
          console.warn("Invalid event skipped:", {
            id: event.id,
            hasTitle,
            hasStart,
            event,
          });
          return false;
        }
        // resourceId debe ser string y no null/undefined
        if (!event.resourceId || typeof event.resourceId !== "string") {
          console.warn("Invalid or missing resourceId for event:", event);
          return false;
        }
        // id debe ser string único
        if (!event.id || typeof event.id !== "string") {
          console.warn("Invalid or missing id for event:", event);
          return false;
        }
        return true;
      })
      .map((event, idx) => {
        const validatedEvent = {
          ...event,
          id:
            typeof event.id === "string"
              ? event.id
              : `evento-${idx}-${Date.now()}`,
          resourceId:
            typeof event.resourceId === "string"
              ? event.resourceId
              : String(event.resourceId),
          editable: true,
          display: event.display || "auto",
        };

        // Log para depurar si las fechas se están alterando en la validación
        if (event.start && event.end) {
          console.log("🔍 validateEvents - Evento procesado:", {
            id: validatedEvent.id,
            title: validatedEvent.title,
            start: validatedEvent.start,
            end: validatedEvent.end,
            duracion:
              validatedEvent.end && validatedEvent.start
                ? Math.round(
                    (new Date(validatedEvent.end) -
                      new Date(validatedEvent.start)) /
                      (1000 * 60)
                  )
                : "N/A",
          });
        }

        return validatedEvent;
      });
  };

  // Manejador de eventos montados
  const handleEventDidMount = (info) => {
    try {
      // Validar que el evento esté bien formado
      if (!info.event || !info.event._def || !info.event._instance) {
        console.warn("Event not properly formed (skipping temporal event):", {
          hasEvent: !!info.event,
          hasDef: !!(info.event && info.event._def),
          hasInstance: !!(info.event && info.event._instance),
          eventId: info.event?.id,
          eventTitle: info.event?.title,
        });
        return;
      }

      // Filtrar eventos temporales de selección (sin ID válido o título)
      if (!info.event.id || !info.event.title || info.event.id === "") {
        console.warn("Skipping temporal selection event:", {
          id: info.event.id,
          title: info.event.title,
        });
        return;
      }

      // Declarar variables de color al inicio para evitar errores de inicialización
      let currentBackgroundColor = "";
      let currentBorderColor = "";
      let currentTextColor = "";

      // Validar que el evento tenga backgroundColor y borderColor antes de intentar accederlos
      try {
        currentBackgroundColor = info.event.backgroundColor || "";
        currentBorderColor = info.event.borderColor || "";
        currentTextColor = info.event.textColor || "";
      } catch (colorError) {
        console.warn("Error accessing color properties:", colorError.message);
        // Ya están inicializadas con valores por defecto
      }

      // Obtener recursos de manera segura
      const eventResources = info.event.getResources
        ? info.event.getResources()
        : [];
      const resourceIds = eventResources.map((r) => r.id);

      // Aplicar clase de estado y color correctamente
      let estado = info.event.extendedProps?.estado;
      console.log("🔍 Detectando estado del evento:", {
        eventoId: info.event.id,
        estadoEnExtendedProps: info.event.extendedProps?.estado,
        statusEnExtendedProps: info.event.extendedProps?.status,
        backgroundColorActual: currentBackgroundColor,
        todoExtendedProps: info.event.extendedProps,
      });

      if (!estado && info.event.extendedProps?.status) {
        // Usar la función mapStatusToEstado para convertir correctamente
        estado = mapStatusToEstado(info.event.extendedProps.status);
        console.log("🔄 Estado convertido desde status:", estado);
      }
      if (!estado) {
        // Solo usar "pendiente" como fallback si realmente no hay ningún estado definido
        // Verificar si el evento ya tiene colores asignados (lo que indicaría que tiene un estado válido)
        if (!currentBackgroundColor || currentBackgroundColor === "#3788d8") {
          estado = "pendiente";
          console.log(
            "⚠️ Usando pendiente como fallback - sin color o color por defecto"
          );
        } else {
          // Intentar inferir el estado del color de fondo
          const bgColor = currentBackgroundColor;
          switch (bgColor) {
            case "#87c947":
              estado = "confirmado";
              break;
            case "#e74c3c":
              estado = "cancelado";
              break;
            case "#ffd54f":
              estado = "pendiente";
              break;
            case "#7f8c8d":
              estado = "facturado";
              break;
            case "#3498db":
              estado = "almuerzo";
              break;
            case "#9b59b6":
              estado = "especial";
              break;
            default:
              estado = "pendiente";
          }
          console.log("🎨 Estado inferido del color:", bgColor, "=>", estado);
        }
      } else {
        console.log("✅ Estado encontrado directamente:", estado);
      }

      console.log("Event mounted:", {
        id: info.event.id,
        title: info.event.title,
        resourceId: resourceIds,
        start: info.event.start,
        estado: estado,
        backgroundColor: currentBackgroundColor,
      });

      // Asegurar que el estado está guardado en extendedProps
      if (!info.event.extendedProps?.estado) {
        try {
          info.event.setExtendedProp("estado", estado);
        } catch (extendedPropError) {
          console.warn(
            "Error setting extendedProp:",
            extendedPropError.message
          );
        }
      }

      // Validar que el evento tenga las propiedades necesarias antes de manipularlas
      try {
        // Solo intentar establecer display si la propiedad existe y es válida
        if (info.event._def && info.event._instance && !info.event.display) {
          info.event.setDisplay("auto");
        }
      } catch (displayError) {
        console.warn(
          "Error setting display property (skipping):",
          displayError.message
        );
        // No retornar, continuar con el resto del procesamiento
      }

      // Ensure the event is draggable
      info.el.setAttribute("draggable", "true");

      // Fix pointer events to ensure dragging works
      info.el.style.pointerEvents = "auto";

      // Ensure drag cursor is shown
      info.el.style.cursor = "move";

      const claseEstado = `estado-${estado}`;
      if (!info.el.classList.contains(claseEstado)) {
        info.el.classList.add(claseEstado);
      }

      // Siempre establecer el color de fondo basado en el estado
      const color = getColorByEstado(estado);
      const textColor = estado === "pendiente" ? "#2c3e50" : "white";

      // Solo sobrescribir las propiedades del evento si es necesario, de forma segura
      try {
        if (currentBackgroundColor !== color && info.event.setProp) {
          info.event.setProp("backgroundColor", color);
        }
        if (currentBorderColor !== color && info.event.setProp) {
          info.event.setProp("borderColor", color);
        }
        if (currentTextColor !== textColor && info.event.setProp) {
          info.event.setProp("textColor", textColor);
        }
      } catch (setPropError) {
        console.warn("Error setting event properties:", setPropError.message);
      }

      // FORZAR el color en el DOM directamente para evitar que FullCalendar lo sobrescriba
      if (info.el) {
        info.el.style.backgroundColor = color + " !important";
        info.el.style.borderColor = color + " !important";
        info.el.style.color = textColor + " !important";

        // También aplicar el color a todos los elementos hijos
        const eventContent = info.el.querySelector(".fc-event-main");
        if (eventContent) {
          eventContent.style.backgroundColor = color + " !important";
          eventContent.style.borderColor = color + " !important";
          eventContent.style.color = textColor + " !important";
        }

        const eventTitle = info.el.querySelector(".fc-event-title");
        if (eventTitle) {
          eventTitle.style.color = textColor + " !important";
        }

        const eventTime = info.el.querySelector(".fc-event-time");
        if (eventTime) {
          eventTime.style.color = textColor + " !important";
        }
      }

      // Add custom CSS classes for better visibility - usar resourceId del evento
      const hasResource = info.event.resourceId || eventResources.length > 0;
      if (hasResource) {
        info.el.classList.add("assigned-event");
      }

      // Fix for making sure technician events are visible
      if (hasResource && !info.el.classList.contains("fc-event-assigned")) {
        info.el.classList.add("fc-event-assigned");
      }

      // Ensure the event is registered as draggable by FullCalendar
      info.el.classList.add("fc-event-draggable");

      // CALCULAR Y FORZAR ALTURA CORRECTA BASADA EN DURACIÓN REAL
      const startTime = new Date(info.event.start);
      const endTime = new Date(info.event.end);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

      // Medir dinámicamente la altura real de un slot de 30 minutos
      let pixelsPerSlot = 20; // Valor por defecto

      try {
        // Buscar una celda de tiempo para medir su altura real
        const timeSlot = document.querySelector(".fc-timegrid-slot");
        if (timeSlot) {
          pixelsPerSlot = timeSlot.getBoundingClientRect().height;
        }
      } catch (e) {
        console.warn(
          "No se pudo medir altura del slot, usando valor por defecto"
        );
      }

      const minutesPerSlot = 30;
      const slotsNeeded = durationMinutes / minutesPerSlot;
      const correctHeight = Math.round(slotsNeeded * pixelsPerSlot);

      console.log("🎯 Calculando altura correcta (medición dinámica):", {
        eventoId: info.event.id,
        duracionMinutos: durationMinutes,
        pixelsPorSlot: pixelsPerSlot + "px (medido)",
        slotsNecesarios: slotsNeeded,
        alturaCorrecta: correctHeight + "px",
        start: startTime.toLocaleTimeString(),
        end: endTime.toLocaleTimeString(),
      });

      // Aplicar altura inmediatamente usando múltiples métodos
      if (info.el) {
        // Método 1: CSS directo con !important
        info.el.style.setProperty("height", correctHeight + "px", "important");
        info.el.style.setProperty(
          "min-height",
          correctHeight + "px",
          "important"
        );
        info.el.style.setProperty("max-height", "none", "important");

        // Método 2: Variable CSS personalizada para mayor control
        info.el.style.setProperty("--custom-height", correctHeight + "px");

        // Método 3: Aplicar también a contenedores internos
        const eventMain = info.el.querySelector(".fc-event-main");
        if (eventMain) {
          eventMain.style.setProperty("height", "100%", "important");
          eventMain.style.setProperty(
            "min-height",
            correctHeight + "px",
            "important"
          );
        }

        const eventMainFrame = info.el.querySelector(".fc-event-main-frame");
        if (eventMainFrame) {
          eventMainFrame.style.setProperty("height", "100%", "important");
          eventMainFrame.style.setProperty(
            "min-height",
            correctHeight + "px",
            "important"
          );
        }

        // Método 4: Forzar posicionamiento si es necesario
        const computedStyle = window.getComputedStyle(info.el);
        if (computedStyle.position === "absolute") {
          // Para eventos con posición absoluta, también ajustar bottom si existe
          if (info.el.style.bottom) {
            info.el.style.removeProperty("bottom");
          }
        }
      }

      // Aplicar con múltiples timeouts para asegurar persistencia
      const applyHeightFix = () => {
        if (info.el && document.contains(info.el)) {
          info.el.style.setProperty(
            "height",
            correctHeight + "px",
            "important"
          );
          info.el.style.setProperty(
            "min-height",
            correctHeight + "px",
            "important"
          );
          info.el.style.setProperty("max-height", "none", "important");
          info.el.style.setProperty("--custom-height", correctHeight + "px");

          const eventMain = info.el.querySelector(".fc-event-main");
          if (eventMain) {
            eventMain.style.setProperty(
              "min-height",
              correctHeight + "px",
              "important"
            );
          }

          console.log("✅ Altura forzada aplicada:", {
            elemento: info.event.id,
            alturaFinal: info.el.style.height,
            alturaCalculada: correctHeight + "px",
            duracion: durationMinutes + " minutos",
            pixelsPorSlot: pixelsPerSlot + "px",
          });
        }
      };

      // Aplicar inmediatamente y con retrasos progresivos
      setTimeout(applyHeightFix, 50);
      setTimeout(applyHeightFix, 200);
      setTimeout(applyHeightFix, 500);
    } catch (error) {
      console.error("Error al montar evento:", error);
      console.log("Evento problemático:", info.event);
    }
  };

  // Función simplificada - ya no forzamos altura
  const forceCorrectEventHeight = (eventElement, startTime, endTime) => {
    // FullCalendar maneja las alturas automáticamente
    return false;
  };

  // Agregar un efecto para limpiar selecciones residuales y prevenir selecciones no deseadas
  useEffect(() => {
    const clearSelections = () => {
      // Solo limpiar las selecciones cuando se hace clic en un evento existente
      // NO limpiar todas las selecciones automáticamente
      const selectionElements = document.querySelectorAll(
        ".fc-event .fc-highlight, .fc-event ~ .fc-highlight, .fc-event-selected::after, .fc-event:focus::after, .fc-selected-cell.fc-has-event"
      );
      selectionElements.forEach((el) => {
        el.style.display = "none";
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      });
    };

    // No usar intervalo para limpiar continuamente, solo configurar los listeners
    document.addEventListener("click", (e) => {
      // Solo limpiar selecciones si se hace clic en un evento existente
      if (e.target.closest(".fc-event")) {
        clearSelections();
      }
    });

    // Función para actualizar la información de tiempo durante el arrastre de selección
    const updateSelectionTimeInfo = (e) => {
      if (
        e.target.closest(".fc-highlight") ||
        document.querySelector(".fc-highlight")
      ) {
        const highlightElements = document.querySelectorAll(".fc-highlight");

        // Forzar visibilidad para todas las selecciones
        highlightElements.forEach((el) => {
          // Asegurar que la selección es completamente visible
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.style.display = "block";

          // Mantener el estilo visual consistente
          el.style.backgroundColor = "rgba(135, 201, 71, 0.3)";
          el.style.border = "2px dashed rgba(135, 201, 71, 0.8)";
          el.style.boxShadow = "0 0 5px rgba(135, 201, 71, 0.5)";

          // Asegurarse de que los elementos de tiempo son visibles
          const timeLabels = el.querySelectorAll(".selection-time-label");
          timeLabels.forEach((label) => {
            label.style.visibility = "visible";
            label.style.opacity = "1";
            label.style.display = "block";
            label.style.zIndex = "100";
          });
        });
      }

      // También hacer visibles las celdas que se están seleccionando
      const selectingCells = document.querySelectorAll(
        ".fc-selecting-cell, .fc-selecting"
      );
      selectingCells.forEach((cell) => {
        cell.style.backgroundColor = "rgba(135, 201, 71, 0.2)";
        cell.style.opacity = "1";
        cell.style.visibility = "visible";
      });
    };

    // Agregar listener para movimiento del mouse para actualizar info de tiempo
    document.addEventListener("mousemove", updateSelectionTimeInfo);

    return () => {
      document.removeEventListener("click", clearSelections);
      document.removeEventListener("mousemove", updateSelectionTimeInfo);
    };
  }, []);

  // Efecto especial para forzar la visibilidad de la selección mientras se arrastra
  useEffect(() => {
    // Usar nuestra nueva utilidad para configurar las visualizaciones de selección
    const cleanup = setupCalendarSelectVisuals();

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  // Función para monitorear la selección de eventos en tiempo real
  useEffect(() => {
    // Agregar un listener global para el evento pointerdown para iniciar el seguimiento
    const handlePointerDown = (e) => {
      // Solo seguir si es un click en el área del calendario (no en eventos)
      if (
        e.target.closest(".fc-timegrid-body") &&
        !e.target.closest(".fc-event")
      ) {
        // Configurar seguimiento de selección
        const handlePointerMove = (moveEvent) => {
          // Buscar los elementos highlight y hacer que sean visibles
          const highlightElements = document.querySelectorAll(".fc-highlight");
          highlightElements.forEach((el) => {
            // Forzar visibilidad para la selección
            el.style.visibility = "visible";
            el.style.opacity = "1";
            el.style.display = "block";
            el.style.borderWidth = "2px";
            el.style.borderStyle = "dashed";
            el.style.borderColor = "rgba(135, 201, 71, 0.8)";
            el.style.backgroundColor = "rgba(135, 201, 71, 0.3)";

            // Asegurarse de que los indicadores de tiempo son visibles
            const timeLabels = el.querySelectorAll(".selection-time-label");
            timeLabels.forEach((label) => {
              label.style.visibility = "visible";
              label.style.opacity = "1";
              label.style.zIndex = "100";
            });
          });

          // También hacer que las celdas que se están seleccionando sean visibles
          document.querySelectorAll(".fc-selecting-cell").forEach((el) => {
            el.style.backgroundColor = "rgba(135, 201, 71, 0.2)";
            el.style.opacity = "1";
            el.style.visibility = "visible";
          });
        };

        // Limpiar evento al soltar
        const handlePointerUp = () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp);
        };

        // Agregar listeners temporales durante la selección
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  // Event listener to refresh calendar when new events are added
  useEffect(() => {
    const handleCalendarUpdateNeeded = (event) => {
      console.log("Calendar update needed event received", event.detail);

      // Force a refresh of the calendar by updating a key event
      if (event.detail && event.detail.event) {
        // Primero intenta usar nuestra referencia directa al calendario
        const calendarApi = getCalendarApi();
        if (calendarApi) {
          console.log("Refreshing calendar with ref API");
          calendarApi.refetchEvents();

          // Si hay un evento específico, intenta agregarlo directamente
          if (event.detail.event) {
            try {
              calendarApi.addEvent(event.detail.event);
            } catch (error) {
              console.warn("Could not add specific event:", error);
            }
          }
        } else {
          // Método alternativo: busca el elemento en el DOM
          const calendarInstance = document.querySelector("#calendario .fc");
          if (calendarInstance && calendarInstance.fullCalendar) {
            console.log("Refreshing calendar with direct DOM API");
            calendarInstance.fullCalendar.refetchEvents();
          } else {
            // Como último recurso, forzar una actualización del estado para re-renderizar
            console.log("Refreshing calendar with state update");
            setEventos((prevEventos) => [...prevEventos]);
          }
        }

        // También actualizar la lista de servicios pendientes
        const servicioId = event.detail.event?.id;
        if (servicioId) {
          console.log("Removing service from pending services:", servicioId);
          setServiciosPendientes((prevServicios) =>
            prevServicios.filter(
              (s) => s.id !== servicioId && s._id !== servicioId
            )
          );
        }
      }
    };

    document.addEventListener(
      "calendar-update-needed",
      handleCalendarUpdateNeeded
    );

    return () => {
      document.removeEventListener(
        "calendar-update-needed",
        handleCalendarUpdateNeeded
      );
    };
  }, []);

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
    const newStart = new Date(info.event.start);
    const newEnd = new Date(info.event.end);
    const resourceId = info.event.getResources()[0]?.id;

    // Verificar solapamientos con el nuevo tamaño
    const conflicto = eventos.find((otroEvento) => {
      if (otroEvento.id === info.event.id) return false; // Ignorar el evento actual
      if (otroEvento.resourceId !== resourceId) return false; // Solo verificar mismo técnico

      const otroInicio = new Date(otroEvento.start);
      const otroFin = new Date(otroEvento.end);

      return (
        (newStart >= otroInicio && newStart < otroFin) ||
        (newEnd > otroInicio && newEnd <= otroFin) ||
        (newStart <= otroInicio && newEnd >= otroFin)
      );
    });

    if (conflicto) {
      mostrarAlerta({
        icon: "error",
        title: "Conflicto de Horario",
        text: "No se puede redimensionar el servicio porque se solaparía con otro servicio",
        confirmButtonColor: "#e74c3c",
      });
      info.revert(); // Revertir el cambio de tamaño
      return;
    }

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

    // Opcional: remover el servicio de los pendientes si corresponde
    if (info.draggedEl && info.draggedEl.classList.contains("servicio-card")) {
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
    mostrarAlerta({
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
          mostrarAlerta({
            title: "Asignar Servicio",
            text: "¿Estás seguro de que deseas asignar este servicio al calendario?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, asignar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#87c947",
            cancelButtonColor: "#e74c3c",
            background: "#f8ffec",
            color: "#004122",
            customClass: {
              confirmButton: "btn-confirm",
              cancelButton: "btn-cancel",
              popup: "dark-theme",
            },
            preConfirm: async () => {
              // Primero mostrar modal para seleccionar técnicos, fecha y duración
              const { value: assignmentData } = await mostrarAlerta({
                title: "Configurar Asignación de Servicio",
                html: `
                <div id="assignmentForm">
                  <div class="form-row-full">
                    <div class="input-group-full">
                      <label>Técnicos (seleccione uno o varios)</label>
                      <div id="tecnicosCheckboxes" class="checkbox-container">
                        ${tecnicos
                          .map(
                            (tecnico) =>
                              `<label class="checkbox-label">
                            <input type="checkbox" value="${tecnico.id}" class="tecnico-checkbox">
                            <span class="checkmark"></span>
                            ${tecnico.title}
                          </label>`
                          )
                          .join("")}
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="input-group">
                      <label>Duración</label>
                      <select id="duracionSelect" class="form-field">
                        <option value="0.5">30 minutos</option>
                        <option value="1" selected>1 hora</option>
                        <option value="1.5">1 hora 30 minutos</option>
                        <option value="2">2 horas</option>
                        <option value="2.5">2 horas 30 minutos</option>
                        <option value="3">3 horas</option>
                        <option value="4">4 horas</option>
                        <option value="6">6 horas</option>
                        <option value="8">8 horas</option>
                      </select>
                    </div>
                    <div class="input-group">
                      <label>Fecha</label>
                      <input type="date" id="fechaSelect" class="form-field" value="${
                        new Date().toISOString().split("T")[0]
                      }">
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="input-group">
                      <label>Hora de inicio</label>
                      <input type="time" id="horaSelect" class="form-field" value="09:00">
                    </div>
                    <div class="input-group">
                      <label>Intervalo entre técnicos (minutos)</label>
                      <select id="intervaloSelect" class="form-field">
                        <option value="0" selected>Mismo horario</option>
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="60">1 hora</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                  </div>

                  <style>
                    #assignmentForm {
                      padding: 20px;
                      background-color: #2d3748;
                      border-radius: 10px;
                      width: 600px;
                      max-width: 600px;
                      margin: 0 auto;
                    }
                    
                    .form-row {
                      display: flex;
                      justify-content: center;
                      margin-bottom: 20px;
                      gap: 20px;
                    }
                    
                    .form-row-full {
                      display: flex;
                      justify-content: center;
                      margin-bottom: 20px;
                      width: 100%;
                    }
                    
                    .input-group {
                      display: flex;
                      flex-direction: column;
                      width: 200px;
                    }
                    
                    .input-group-full {
                      display: flex;
                      flex-direction: column;
                      width: 100%;
                    }
                    
                    .input-group label, .input-group-full label {
                      color: #87c947;
                      font-weight: 500;
                      margin-bottom: 8px;
                      font-size: 14px;
                    }
                    
                    .form-field {
                      padding: 10px 12px;
                      border: 1px solid #4a5568;
                      border-radius: 6px;
                      background-color: #1a202c;
                      color: white;
                      width: 100%;
                      height: 40px;
                      box-sizing: border-box;
                      font-size: 14px;
                    }
                    
                    .form-field:focus {
                      border-color: #87c947;
                      outline: none;
                      box-shadow: 0 0 0 1px #87c947;
                    }
                    
                    .checkbox-container {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 10px;
                      padding: 10px;
                      background-color: #1a202c;
                      border: 1px solid #4a5568;
                      border-radius: 6px;
                      max-height: 120px;
                      overflow-y: auto;
                    }
                    
                    .checkbox-label {
                      display: flex;
                      align-items: center;
                      color: white;
                      cursor: pointer;
                      padding: 5px 10px;
                      border-radius: 4px;
                      transition: background-color 0.2s;
                      min-width: 120px;
                    }
                    
                    .checkbox-label:hover {
                      background-color: #4a5568;
                    }
                    
                    .tecnico-checkbox {
                      margin-right: 8px;
                      accent-color: #87c947;
                    }
                    
                    .checkbox-label input[type="checkbox"]:checked + .checkmark {
                      background-color: #87c947;
                    }
                  </style>
                </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Continuar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#87c947",
                cancelButtonColor: "#383a46",
                background: "#1e1e2f",
                color: "#ffffff",
                preConfirm: () => {
                  const tecnicosCheckboxes = document.querySelectorAll(
                    ".tecnico-checkbox:checked"
                  );
                  const tecnicosIds = Array.from(tecnicosCheckboxes).map(
                    (checkbox) => checkbox.value
                  );
                  const duracion = parseFloat(
                    document.getElementById("duracionSelect").value
                  );
                  const fecha = document.getElementById("fechaSelect").value;
                  const hora = document.getElementById("horaSelect").value;
                  const intervalo = parseInt(
                    document.getElementById("intervaloSelect").value
                  );

                  if (!tecnicosIds.length || !duracion || !fecha || !hora) {
                    mostrarAlerta({
                      icon: "error",
                      title: "Error",
                      text: "Por favor seleccione al menos un técnico y complete todos los campos",
                      confirmButtonColor: "#87c947",
                    });
                    return false;
                  }

                  return { tecnicosIds, duracion, fecha, hora, intervalo };
                },
              });

              if (!assignmentData) return false;

              console.log("Datos de asignación recibidos:", assignmentData);

              // Activar flag para evitar procesamiento automático
              setIsProcessingTempEvent(true);

              // Función para formatear fecha manteniendo la zona horaria local
              const formatearFechaLocal = (fecha) => {
                const year = fecha.getFullYear();
                const month = String(fecha.getMonth() + 1).padStart(2, "0");
                const day = String(fecha.getDate()).padStart(2, "0");
                const hours = String(fecha.getHours()).padStart(2, "0");
                const minutes = String(fecha.getMinutes()).padStart(2, "0");
                const seconds = String(fecha.getSeconds()).padStart(2, "0");

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
              };

              // Crear eventos para cada técnico seleccionado
              const eventosCreados = [];
              let servicioBaseId = null;

              for (let i = 0; i < assignmentData.tecnicosIds.length; i++) {
                const tecnicoId = assignmentData.tecnicosIds[i];

                // Calcular offset de tiempo para este técnico
                const offsetMinutos = i * assignmentData.intervalo;

                // Crear fechas de inicio y fin basadas en la selección y offset
                const fechaHoraInicio = new Date(
                  `${assignmentData.fecha}T${assignmentData.hora}`
                );
                fechaHoraInicio.setMinutes(
                  fechaHoraInicio.getMinutes() + offsetMinutos
                );
                const fechaHoraFin = new Date(
                  fechaHoraInicio.getTime() +
                    assignmentData.duracion * 60 * 60 * 1000
                );

                // Crear ID único para este evento específico (servicio + técnico)
                const eventoId = `${
                  servicio._id || servicio.id
                }-${tecnicoId}-${Date.now()}`;

                // Crear evento con fechas específicas y preservar el horario seleccionado
                const eventoParaAsignar = {
                  id: eventoId,
                  start: formatearFechaLocal(fechaHoraInicio),
                  end: formatearFechaLocal(fechaHoraFin),
                  resourceId: tecnicoId,
                  title: `${mapServiceTypeToSpanish(
                    servicio.serviceType || servicio.nombre
                  )} - ${servicio.clientName || servicio.name || "Cliente"}`,
                  backgroundColor: "#87c947",
                  borderColor: "#87c947",
                  className: "estado-confirmado",
                  textColor: "white",
                  display: "block",
                  extendedProps: {
                    ...servicio,
                    estado: "confirmado",
                    preserveEvent: true,
                    isLocalEvent: true,
                    scheduledStart: formatearFechaLocal(fechaHoraInicio),
                    scheduledEnd: formatearFechaLocal(fechaHoraFin),
                    serviceId: servicio._id || servicio.id,
                    originalServiceData: servicio,
                  },
                };

                console.log(
                  `Creando evento para técnico ${tecnicoId}:`,
                  eventoParaAsignar
                );
                eventosCreados.push(eventoParaAsignar);
              }

              // Agregar todos los eventos al estado de una vez
              setEventos((prevEventos) => {
                const nuevosEventos = [...prevEventos, ...eventosCreados];
                console.log(
                  `📊 Total de eventos después de agregar ${eventosCreados.length} nuevos:`,
                  nuevosEventos.length
                );
                return nuevosEventos;
              });

              try {
                // Solo necesitamos actualizar el servicio una vez en el backend
                // Usar el primer evento como referencia pero incluir todos los técnicos
                const eventoReferencia = eventosCreados[0];

                console.log("🔄 Iniciando asignación múltiple en backend...");
                const servicioActualizado = await handleAsignarServicio(
                  eventoReferencia,
                  servicio._id || servicio.id,
                  assignmentData.tecnicosIds, // Pasar todos los técnicos
                  true // skipRefresh = true para evitar conflictos
                );

                console.log("📤 Respuesta del backend:", servicioActualizado);

                // Verificar si el servicio se actualizó correctamente
                // (podría ser un objeto vacío si hubo errores manejados)
                const servicioValido =
                  servicioActualizado &&
                  (servicioActualizado._id ||
                    servicioActualizado.id ||
                    typeof servicioActualizado === "object");

                if (servicioValido) {
                  console.log(
                    "✅ Servicio base actualizado exitosamente:",
                    servicioActualizado._id ||
                      servicioActualizado.id ||
                      "ID fallback"
                  );

                  // Actualizar todos los eventos creados con el ID real del servicio
                  setEventos((prevEventos) =>
                    prevEventos.map((evento) => {
                      const eventoCreado = eventosCreados.find(
                        (ec) => ec.id === evento.id
                      );
                      if (eventoCreado) {
                        return {
                          ...evento,
                          extendedProps: {
                            ...evento.extendedProps,
                            serviceId:
                              servicioActualizado._id ||
                              servicioActualizado.id ||
                              servicio._id ||
                              servicio.id,
                            isLocalEvent: false,
                            preserveEvent: true,
                            backendProcessed: true, // Marcar como procesado en backend
                          },
                        };
                      }
                      return evento;
                    })
                  );

                  // Desactivar flag después de un delay más largo para evitar interferencias
                  setTimeout(() => {
                    setIsProcessingTempEvent(false);
                    console.log(
                      "🔓 DESBLOQUEADO: processServices puede ejecutarse nuevamente"
                    );
                  }, 5000); // 5 segundos en lugar de 1

                  mostrarAlerta({
                    icon: "success",
                    title: "Servicio Asignado",
                    text: `El servicio se asignó exitosamente a ${
                      assignmentData.tecnicosIds.length
                    } técnico(s) con horarios ${
                      assignmentData.intervalo > 0
                        ? "escalonados"
                        : "simultáneos"
                    }.`,
                    timer: 3000,
                    timerProgressBar: true,
                    background: "#f8ffec",
                    color: "#004122",
                  });

                  // Cerrar el modal principal
                  Swal.close();
                  return true;
                } else {
                  console.warn(
                    "⚠️ Backend devolvió respuesta inválida, manteniendo eventos locales"
                  );

                  // Mantener los eventos pero marcarlos como locales
                  setEventos((prevEventos) =>
                    prevEventos.map((evento) => {
                      const eventoCreado = eventosCreados.find(
                        (ec) => ec.id === evento.id
                      );
                      if (eventoCreado) {
                        return {
                          ...evento,
                          extendedProps: {
                            ...evento.extendedProps,
                            isLocalEvent: true,
                            preserveEvent: true,
                            backendError: true, // Marcar que hubo error en backend
                          },
                        };
                      }
                      return evento;
                    })
                  );

                  setIsProcessingTempEvent(false);
                  console.log(
                    "🔓 DESBLOQUEADO: processServices (error parcial)"
                  );

                  mostrarAlerta({
                    icon: "warning",
                    title: "Asignación Parcial",
                    text: "Los eventos se crearon localmente pero hubo problemas con el backend. Los servicios aparecen en el calendario pero podrían no persistir al recargar.",
                    confirmButtonColor: "#87c947",
                  });
                  return true; // Mantener como exitoso para no eliminar eventos
                }
              } catch (error) {
                console.error("❌ Error en asignación múltiple:", error);

                // En lugar de eliminar todos los eventos, mantenerlos como locales
                console.log(
                  "🔄 Manteniendo eventos como locales debido a error de backend"
                );
                setEventos((prevEventos) =>
                  prevEventos.map((evento) => {
                    const eventoCreado = eventosCreados.find(
                      (ec) => ec.id === evento.id
                    );
                    if (eventoCreado) {
                      return {
                        ...evento,
                        extendedProps: {
                          ...evento.extendedProps,
                          isLocalEvent: true,
                          preserveEvent: true,
                          backendError: true,
                          errorDetails: error.message,
                        },
                      };
                    }
                    return evento;
                  })
                );

                setIsProcessingTempEvent(false);
                console.log(
                  "🔓 DESBLOQUEADO: processServices (error de conexión)"
                );

                mostrarAlerta({
                  icon: "warning",
                  title: "Error de Conexión",
                  text: "Los eventos se mantienen en el calendario pero hubo problemas de conexión con el servidor. Intente sincronizar más tarde.",
                  confirmButtonColor: "#87c947",
                });
                return true; // Retornar true para mantener los eventos
              }
            },
          });
        });

        document.getElementById("btnEliminar").addEventListener("click", () => {
          mostrarAlerta({
            title: "Eliminar Servicio",
            text: "¿Estás seguro de que deseas eliminar este servicio?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#e74c3c",
            cancelButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
            customClass: {
              confirmButton: "btn-confirm",
              cancelButton: "btn-cancel",
              popup: "dark-theme",
            },
            preConfirm: () => {
              return handleEliminarServicio(servicio.id);
            },
          });
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
      facturado: "#7f8c8d",
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
    // Agregar estilos del menú contextual y colores forzados de eventos
    const style = document.createElement("style");
    style.textContent = `
      /* Prevenir menú contextual del navegador en el área del calendario excepto en nombres de técnicos */
      .fc-view-harness, .fc-daygrid-body, .fc-timegrid-body, .fc-resource-timeline-body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Preservar apariencia original de los eventos */
      .fc-event {
        z-index: 10 !important;
        position: relative !important;
      }
      
      /* Ocultar cualquier efecto de selección en eventos sin afectar su tamaño/diseño */
      .fc-event-selected,
      .fc-event:focus,
      .fc-event-selected::after,
      .fc-event:focus::after {
        box-shadow: none !important;
        outline: none !important;
      }
      
      /* Permitir animaciones de selección en áreas vacías pero no en eventos */
      .fc-highlight {
        background-color: rgba(135, 201, 71, 0.3) !important; /* Verde semi-transparente */
        border: 2px dashed rgba(135, 201, 71, 0.8) !important;
        opacity: 1 !important;
        visibility: visible !important;
        position: relative !important;
        z-index: 5 !important;
        pointer-events: auto !important;
        display: block !important;
      }
      
      /* Estilos para celdas durante el arrastre de selección */
      .fc-selecting {
        background-color: rgba(135, 201, 71, 0.2) !important;
      }
      
      /* Estilos para el rectángulo de selección mientras se arrastra */
      .fc-selecting-cell {
        background-color: rgba(135, 201, 71, 0.2) !important;
      }
      
      /* Estilo específico para selecciones visibles */
      .visible-selection {
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
      }
      
      /* Desactivar indicadores solo cuando haya conflicto */
      .fc-event .fc-highlight,
      .fc-event ~ .fc-highlight {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* Mantener el cursor correcto para eventos */
      .fc-event {
        cursor: pointer !important; 
      }
      
      /* Estilos para las celdas durante la selección */
      .fc-selecting-cell {
        background-color: rgba(135, 201, 71, 0.2) !important;
      }
      
      /* Estilos específicos para el proceso de selección actual */
      .fc-timegrid-col.fc-day.fc-day-future:not(.fc-day-other).fc-selecting,
      .fc-timegrid-col.fc-day.fc-day-past:not(.fc-day-other).fc-selecting,
      .fc-timegrid-col.fc-day.fc-day-today:not(.fc-day-other).fc-selecting,
      .fc-timegrid-body .fc-selecting {
        background-color: rgba(135, 201, 71, 0.1) !important;
      }
      
      /* Permitir menú contextual solo en nombres de técnicos */
      .tecnico-label-clickable {
        -webkit-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
        position: relative;
        z-index: 10;
      }
      
      /* Estilos mejorados para el área clickeable del técnico */
      .tecnico-label-clickable:hover {
        background-color: rgba(135, 201, 71, 0.1) !important;
        border-radius: 4px;
      }
      
      .tecnico-label-clickable::after {
        content: "⋮";
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: #87c947;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .tecnico-label-clickable:hover::after {
        opacity: 1;
      }

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

      /* FORZAR ALTURA CORRECTA PARA EVENTOS DE CUALQUIER DURACIÓN */
      .fc-timegrid-event {
        height: auto !important;
        min-height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
      
      .fc-timegrid-event .fc-event-main {
        height: 100% !important;
        min-height: 100% !important;
        max-height: none !important;
        overflow: visible !important;
      }
      
      .fc-timegrid-event .fc-event-main-frame {
        height: 100% !important;
        min-height: 100% !important;
        max-height: none !important;
        overflow: visible !important;
      }
      
      /* Asegurar que las alturas forzadas se respeten SIEMPRE */
      .fc-timegrid-event[style*="height"] {
        height: auto !important;
      }
      
      /* Prevenir que FullCalendar sobrescriba alturas personalizadas */
      .fc-timegrid-event[style*="height"][style*="important"] {
        height: var(--custom-height, auto) !important;
      }
      
      /* Arreglar cabecera de técnicos que se desalineó */
      .fc-resource-area-header,
      .fc-resource-area {
        position: sticky !important;
        top: 0 !important;
        z-index: 100 !important;
        background: white !important;
      }

      /* Estilos forzados para eventos por estado */
      .fc-event.estado-pendiente,
      .fc-event.estado-pendiente .fc-event-main,
      .fc-event.estado-pendiente .fc-event-main-frame {
        background-color: #ffd54f !important;
        border-color: #ffd54f !important;
        color: #2c3e50 !important;
      }

      .fc-event.estado-confirmado,
      .fc-event.estado-confirmado .fc-event-main,
      .fc-event.estado-confirmado .fc-event-main-frame {
        background-color: #87c947 !important;
        border-color: #87c947 !important;
        color: white !important;
      }

      .fc-event.estado-cancelado,
      .fc-event.estado-cancelado .fc-event-main,
      .fc-event.estado-cancelado .fc-event-main-frame {
        background-color: #e74c3c !important;
        border-color: #e74c3c !important;
        color: white !important;
      }

      .fc-event.estado-facturado,
      .fc-event.estado-facturado .fc-event-main,
      .fc-event.estado-facturado .fc-event-main-frame {
        background-color: #7f8c8d !important;
        border-color: #7f8c8d !important;
        color: white !important;
      }

      .fc-event.estado-almuerzo,
      .fc-event.estado-almuerzo .fc-event-main,
      .fc-event.estado-almuerzo .fc-event-main-frame {
        background-color: #3498db !important;
        border-color: #3498db !important;
        color: white !important;
      }

      .fc-event.estado-especial,
      .fc-event.estado-especial .fc-event-main,
      .fc-event.estado-especial .fc-event-main-frame {
        background-color: #9b59b6 !important;
        border-color: #9b59b6 !important;
        color: white !important;
      }

      /* Forzar colores en el texto de los eventos */
      .fc-event.estado-pendiente .fc-event-title,
      .fc-event.estado-pendiente .fc-event-time {
        color: #2c3e50 !important;
      }

      .fc-event.estado-confirmado .fc-event-title,
      .fc-event.estado-confirmado .fc-event-time,
      .fc-event.estado-cancelado .fc-event-title,
      .fc-event.estado-cancelado .fc-event-time,
      .fc-event.estado-facturado .fc-event-title,
      .fc-event.estado-facturado .fc-event-time,
      .fc-event.estado-almuerzo .fc-event-title,
      .fc-event.estado-almuerzo .fc-event-time,
      .fc-event.estado-especial .fc-event-title,
      .fc-event.estado-especial .fc-event-time {
        color: white !important;
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

  // La función getCalendarApi ya está definida arriba

  // Función para agregar directamente un evento al calendario usando la API
  const addEventToCalendar = (event) => {
    const api = getCalendarApi();
    if (api) {
      console.log("Adding event directly via calendar API:", event);
      api.addEvent(event);
      return true;
    }
    console.warn("Calendar API not available, couldn't add event directly");
    return false;
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark-theme" : ""}`}>
      <Sidebar
        serviciosPendientes={serviciosPendientes}
        onAgregarServicio={handleAgregarServicio}
        onEliminarServicio={handleEliminarServicio}
        onAsignarServicio={handleAsignarServicio}
        onEditarServicio={handleEditarServicio}
      />
      <div className="main-content">
        <CalendarHeader onAgregarTecnico={handleAgregarTecnico} />
        <div id="calendario">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              resourceTimeGridPlugin,
              multiMonthPlugin,
            ]}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
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
                nowIndicator: true,
                eventContent: renderEventContent,
                defaultTimedEventDuration: null,
                forceEventDuration: false,
                slotEventOverlap: false,
                // Sin configuración de altura específica - usar defaults de FullCalendar
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
                eventContent: renderEventContent,
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
                eventContent: renderEventContent,
              },
            }}
            resources={tecnicos}
            events={validateEvents(eventos)}
            editable={true}
            eventStartEditable={true}
            eventDurationEditable={true}
            droppable={true}
            eventOverlap={false}
            eventConstraint={{
              start: "06:00:00",
              end: "20:00:00",
            }}
            eventResizableFromStart={true}
            dragRevertDuration={0}
            dragScroll={true}
            datesSet={(arg) => {
              // Cuando cambia la vista o las fechas mostradas
              if (arg.view.type === "resourceTimeGridDay") {
                scrollToCurrentTime();
              }
            }}
            businessHours={false}
            snapDuration={"00:30:00"}
            slotDuration={"00:30:00"}
            slotLabelInterval={"01:00:00"}
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            aspectRatio={1.8}
            defaultTimedEventDuration={null}
            forceEventDuration={false}
            nextDayThreshold={"00:00:00"}
            height={600}
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
            selectMirror={true} // Habilitar el espejo de selección para visualizar mientras se arrastra
            unselectAuto={true}
            selectMinDistance={2} // Distancia mínima razonable para evitar selecciones accidentales
            selectLongPressDelay={300} // Delay razonable para evitar selecciones por clicks rápidos
            selectAllow={(selectInfo) => {
              // Verificación básica - debe haber un recurso
              if (!selectInfo?.resource?.id) {
                return false;
              }

              // Verificar si hay algún evento existente que se solape con esta selección
              const hasOverlap = eventos.some((evento) => {
                // Solo considerar eventos en el mismo recurso (técnico)
                if (evento.resourceId !== selectInfo.resource.id) {
                  return false;
                }

                const eventStart = new Date(evento.start);
                const eventEnd = new Date(evento.end);
                const selectStart = new Date(selectInfo.start);
                const selectEnd = new Date(selectInfo.end);

                // Verificar solapamiento
                return (
                  (selectStart >= eventStart && selectStart < eventEnd) ||
                  (selectEnd > eventStart && selectEnd <= eventEnd) ||
                  (selectStart <= eventStart && selectEnd >= eventEnd)
                );
              });

              return !hasOverlap; // Permitir selección solo si NO hay solapamiento
            }}
            select={(info) => {
              console.log("🎯 Select disparado en FullCalendar:", {
                view: info.view.type,
                start: info.startStr,
                end: info.endStr,
                resource: info.resource?.id,
              });

              // Usar nuestra función de ayuda para añadir etiquetas de tiempo a la selección
              addTimeLabelsToSelection(info);

              // Permitir selección en vistas de tiempo y solo si hay un recurso (técnico) seleccionado
              const isTimeGridView =
                info.view.type.includes("timeGrid") ||
                info.view.type.includes("resourceTimeGrid");
              const hasResource = info.resource?.id;

              if (isTimeGridView && hasResource) {
                handleDateSelect(info);
              } else if (!hasResource) {
                console.log(
                  "⚠️ No se puede crear servicio sin técnico asignado"
                );
                // Mostrar mensaje informativo
                mostrarAlerta({
                  icon: "info",
                  title: "Selecciona un Técnico",
                  text: "Para crear un servicio, debe seleccionar una fecha en la columna de un técnico específico.",
                  timer: 2000,
                  showConfirmButton: false,
                  background: "#f8ffec",
                  color: "#004122",
                });
              }
            }}
            eventClick={(info) => {
              console.log("🎯 EventClick disparado en FullCalendar:", info);

              // Prevenir TOTALMENTE cualquier comportamiento por defecto o propagación
              if (info.jsEvent) {
                info.jsEvent.preventDefault();
                info.jsEvent.stopPropagation();
                info.jsEvent.stopImmediatePropagation();
              }

              // Deseleccionar cualquier selección activa inmediatamente
              info.view.calendar.unselect();

              // Eliminar cualquier indicador de selección SOLO en los eventos
              const removeSelectionIndicators = () => {
                // Solo remover indicadores si estamos haciendo clic en un evento existente
                // NO remover la selección actual en áreas vacías
                const selectionElements = document.querySelectorAll(
                  ".fc-event .fc-highlight, .fc-event ~ .fc-highlight"
                );
                selectionElements.forEach((el) => {
                  el.style.opacity = "0";
                  el.style.visibility = "hidden";
                });
              };

              // Ejecutar ahora y con un pequeño retraso para asegurarnos de eliminar cualquier selección
              removeSelectionIndicators();
              setTimeout(removeSelectionIndicators, 50);

              // Manejar el clic en el evento existente
              handleEventClick(info);
            }}
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
