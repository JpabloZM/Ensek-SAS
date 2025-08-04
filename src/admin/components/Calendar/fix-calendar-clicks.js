/**
 * Script para solucionar problemas de clicks en eventos del calendario
 * Este script se encarga de detectar todos los eventos del calendario y
 * agregar manejadores de eventos de clic directamente a ellos.
 */

// Función principal para inicializar los manejadores de eventos
export function initCalendarEventClickHandlers(
  handleEventClickCallback,
  eventos
) {
  // Verificar que tenemos una función callback válida
  if (typeof handleEventClickCallback !== "function") {
    console.error("❌ handleEventClickCallback debe ser una función");
    return;
  }

  console.log("🔧 Inicializando fix para clicks en eventos del calendario");

  // Función para agregar manejadores de clic a todos los eventos del calendario
  function attachClickHandlers() {
    const eventElements = document.querySelectorAll(
      ".fc-event, .fc-daygrid-event, .fc-timegrid-event"
    );
    console.log(
      `🔍 Encontrados ${eventElements.length} elementos de eventos en el calendario`
    );

    let handlerCount = 0;

    eventElements.forEach((eventEl) => {
      // Verificar si el elemento ya tiene un manejador de clics
      if (eventEl.getAttribute("data-click-handler-attached") === "true") {
        return;
      }

      // Marcar el elemento como que ya tiene un manejador de clics
      eventEl.setAttribute("data-click-handler-attached", "true");

      // Mejorar la apariencia visual para indicar que es clickeable
      eventEl.style.cursor = "pointer";

      // Intentar obtener el ID del evento
      let eventId = null;

      // Método 1: Buscar en atributos de datos
      eventId =
        eventEl.getAttribute("data-event-id") ||
        eventEl.getAttribute("data-id") ||
        eventEl.getAttribute("data-fc-id");

      // Método 2: Buscar en clases (patrón común en FullCalendar)
      if (!eventId) {
        const fcEventIdClass = Array.from(eventEl.classList).find(
          (cls) =>
            cls.startsWith("fc-event-") ||
            cls.startsWith("fc-id-") ||
            cls.includes("_")
        );

        if (fcEventIdClass) {
          // Intentar extraer el ID de la clase
          const parts = fcEventIdClass.split("-");
          if (parts.length >= 3) {
            eventId = parts.slice(2).join("-");
          } else if (fcEventIdClass.includes("_")) {
            eventId = fcEventIdClass;
          }
        }
      }

      // Método 3: Usar un ID generado si no se encuentra ninguno
      if (!eventId) {
        eventId = `event-${Math.random().toString(36).substring(2, 15)}`;
        eventEl.setAttribute("data-event-id", eventId);
      }

      // Agregar manejador de clic
      eventEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(`🖱️ Clic detectado en evento con ID: ${eventId}`);

        // Encontrar el evento correspondiente en el estado
        const evento = Array.isArray(eventos)
          ? eventos.find((ev) => ev.id === eventId || ev._id === eventId)
          : null;

        if (evento) {
          console.log("✅ Evento encontrado en el estado:", evento);

          // Crear un objeto info para pasar al callback
          const mockInfo = {
            event: {
              id: evento.id || evento._id,
              title: evento.title,
              start: evento.start ? new Date(evento.start) : new Date(),
              end: evento.end
                ? new Date(evento.end)
                : new Date(new Date().getTime() + 3600000),
              resourceId: evento.resourceId,
              extendedProps: evento.extendedProps || {},
              getResources: () =>
                evento.resourceId ? [{ id: evento.resourceId }] : [],
            },
            jsEvent: e,
            el: eventEl,
          };

          // Llamar al callback con la información del evento
          handleEventClickCallback(mockInfo);
        } else {
          console.log(
            "⚠️ No se encontró el evento en el estado, usando datos del DOM"
          );

          // Extraer información del elemento DOM
          const title =
            eventEl.querySelector(".fc-event-title")?.textContent ||
            eventEl.querySelector(".fc-title")?.textContent ||
            eventEl.textContent ||
            "Evento sin título";

          // Crear un objeto info básico para pasar al callback
          const basicInfo = {
            event: {
              id: eventId,
              title: title.trim(),
              start: new Date(),
              end: new Date(new Date().getTime() + 3600000),
              extendedProps: {},
              getResources: () => [],
            },
            jsEvent: e,
            el: eventEl,
          };

          // Llamar al callback con la información básica
          handleEventClickCallback(basicInfo);
        }
      });

      handlerCount++;
    });

    console.log(
      `✅ Se agregaron ${handlerCount} manejadores de clic a eventos del calendario`
    );
  }

  // Configurar un observer para detectar nuevos eventos añadidos al calendario
  const observer = new MutationObserver((mutations) => {
    let hasNewEvents = false;
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Verificar si se agregaron nuevos eventos
        const hasEventNodes = Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          return (
            node.classList?.contains("fc-event") ||
            node.classList?.contains("fc-daygrid-event") ||
            node.classList?.contains("fc-timegrid-event") ||
            node.querySelector?.(
              ".fc-event, .fc-daygrid-event, .fc-timegrid-event"
            )
          );
        });

        if (hasEventNodes) {
          hasNewEvents = true;
        }
      }
    });

    // Si se detectaron nuevos eventos, volver a configurar los manejadores
    if (hasNewEvents) {
      console.log(
        "🔄 Detectados nuevos eventos en el calendario, actualizando manejadores"
      );
      setTimeout(attachClickHandlers, 100);
    }
  });

  // Iniciar la observación de cambios en el DOM del calendario
  const startObserving = () => {
    const calendarEl = document.querySelector("#calendario");
    if (calendarEl) {
      observer.observe(calendarEl, {
        childList: true,
        subtree: true,
      });
      console.log("👁️ Observer iniciado para el calendario");
    } else {
      console.warn(
        "⚠️ No se encontró el elemento del calendario para observar"
      );
      setTimeout(startObserving, 500);
    }
  };

  // Configurar los manejadores iniciales después de un breve retraso
  setTimeout(() => {
    attachClickHandlers();
    startObserving();

    // También configurar un intervalo para verificar periódicamente
    setInterval(attachClickHandlers, 3000);
  }, 1000);

  // Devolver una función para limpiar los observers
  return function cleanup() {
    observer.disconnect();
  };
}
