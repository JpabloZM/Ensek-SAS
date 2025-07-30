// Esta función reemplaza a selectClassNames para compatibilidad con versiones recientes de FullCalendar
// Maneja la visualización de selecciones en el calendario

export function setupCalendarSelectVisuals() {
  // Configurar un observador de mutaciones para detectar cuando se crea un elemento de selección
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // Buscar elementos de selección nuevos
        const highlightElements = document.querySelectorAll(".fc-highlight");
        if (highlightElements.length > 0) {
          highlightElements.forEach((el) => {
            // Hacer visible la selección
            el.style.visibility = "visible";
            el.style.opacity = "1";
            el.style.display = "block";
            el.style.backgroundColor = "rgba(135, 201, 71, 0.3)";
            el.style.border = "2px dashed rgba(135, 201, 71, 0.8)";
            el.style.boxShadow = "0 0 5px rgba(135, 201, 71, 0.5)";

            // Agregar clase personalizada
            el.classList.add("visible-selection");
          });

          // También hacer visibles las celdas que se están seleccionando
          document
            .querySelectorAll(".fc-selecting-cell, .fc-selecting")
            .forEach((cell) => {
              cell.style.backgroundColor = "rgba(135, 201, 71, 0.2)";
              cell.style.opacity = "1";
              cell.style.visibility = "visible";
            });
        }
      }
    });
  });

  // Observar cambios en el contenedor del calendario
  const calendarContainer = document.getElementById("calendario");
  if (calendarContainer) {
    observer.observe(calendarContainer, {
      childList: true,
      subtree: true,
    });
  }

  // Definir el handler como una función nombrada para poder removerla después
  const handleMouseMove = (e) => {
    if (
      document.querySelector(".fc-highlight, .fc-selecting-cell, .fc-selecting")
    ) {
      // Seleccionar todos los elementos de selección
      const highlightElements = document.querySelectorAll(".fc-highlight");

      highlightElements.forEach((el) => {
        // Hacer visible la selección
        el.style.visibility = "visible";
        el.style.opacity = "1";
        el.style.display = "block";
        el.style.backgroundColor = "rgba(135, 201, 71, 0.3)";
        el.style.border = "2px dashed rgba(135, 201, 71, 0.8)";
        el.style.boxShadow = "0 0 5px rgba(135, 201, 71, 0.5)";
      });

      // También hacer visibles las celdas que se están seleccionando
      document
        .querySelectorAll(".fc-selecting-cell, .fc-selecting")
        .forEach((cell) => {
          cell.style.backgroundColor = "rgba(135, 201, 71, 0.2)";
          cell.style.opacity = "1";
          cell.style.visibility = "visible";
        });
    }
  };

  // Agregar el escuchador de eventos para el evento de selección
  document.addEventListener("mousemove", handleMouseMove);

  // Retornar una función para limpiar
  return () => {
    observer.disconnect();
    document.removeEventListener("mousemove", handleMouseMove);
  };
}

// Función para agregar etiquetas de tiempo a las selecciones
export function addTimeLabelsToSelection(info) {
  setTimeout(() => {
    // Seleccionar todos los elementos de selección
    const highlightElements = document.querySelectorAll(".fc-highlight");

    if (!info || !info.start || !info.end) return;

    // Calcular la duración en minutos para mostrarla
    const startTime = new Date(info.start);
    const endTime = new Date(info.end);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

    // Formatear hora como HH:MM
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    highlightElements.forEach((el) => {
      // Asegurar que el elemento tenga el tamaño adecuado y sea completamente visible
      el.style.height = "100%";
      el.style.width = "100%";
      el.style.visibility = "visible !important";
      el.style.opacity = "1";
      el.style.display = "block";
      el.style.backgroundColor = "rgba(135, 201, 71, 0.4)"; // Más opaco para mejor visibilidad
      el.style.border = "3px dashed rgba(135, 201, 71, 0.9)"; // Borde más grueso y visible
      el.style.boxShadow = "0 0 8px rgba(135, 201, 71, 0.7)"; // Sombra más pronunciada
      el.style.position = "relative";
      el.style.zIndex = "10"; // Mayor z-index para asegurar visibilidad

      // Crear elementos para mostrar la hora de inicio y fin con mejor visibilidad
      const startLabel = document.createElement("div");
      startLabel.className = "selection-time-label start-time";
      startLabel.textContent = formatTime(startTime);
      startLabel.style.position = "absolute";
      startLabel.style.top = "5px";
      startLabel.style.left = "5px";
      startLabel.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Más opaco
      startLabel.style.color = "white";
      startLabel.style.padding = "4px 8px"; // Padding más grande
      startLabel.style.borderRadius = "4px";
      startLabel.style.fontSize = "13px"; // Texto más grande
      startLabel.style.fontWeight = "bold";
      startLabel.style.zIndex = "100";
      startLabel.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)"; // Sombra para destacar

      const endLabel = document.createElement("div");
      endLabel.className = "selection-time-label end-time";
      endLabel.textContent = formatTime(endTime);
      endLabel.style.position = "absolute";
      endLabel.style.bottom = "5px";
      endLabel.style.right = "5px";
      endLabel.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Más opaco
      endLabel.style.color = "white";
      endLabel.style.padding = "4px 8px"; // Padding más grande
      endLabel.style.borderRadius = "4px";
      endLabel.style.fontSize = "13px"; // Texto más grande
      endLabel.style.fontWeight = "bold";
      endLabel.style.zIndex = "100";
      endLabel.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)"; // Sombra para destacar

      // Agregar etiqueta central con la duración, más destacada
      const durationLabel = document.createElement("div");
      durationLabel.className = "selection-time-label duration";
      durationLabel.textContent = `${durationMinutes} min`;
      durationLabel.style.position = "absolute";
      durationLabel.style.top = "50%";
      durationLabel.style.left = "50%";
      durationLabel.style.transform = "translate(-50%, -50%)";
      durationLabel.style.backgroundColor = "rgba(135, 201, 71, 1.0)"; // Color sólido para destacar
      durationLabel.style.color = "white";
      durationLabel.style.padding = "5px 10px"; // Padding más grande
      durationLabel.style.borderRadius = "4px";
      durationLabel.style.fontSize = "15px"; // Texto más grande
      durationLabel.style.fontWeight = "bold";
      durationLabel.style.zIndex = "100";
      durationLabel.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.3)"; // Sombra más pronunciada

      // Limpiar etiquetas anteriores y agregar las nuevas
      el.querySelectorAll(".selection-time-label").forEach((label) =>
        label.remove()
      );
      el.appendChild(startLabel);
      el.appendChild(endLabel);
      el.appendChild(durationLabel);
    });

    // También asegurar que las celdas que se están seleccionando sean visibles
    document
      .querySelectorAll(".fc-selecting-cell, .fc-selecting")
      .forEach((cell) => {
        cell.style.backgroundColor = "rgba(135, 201, 71, 0.3)"; // Más visible
        cell.style.opacity = "1";
        cell.style.visibility = "visible";
      });

    // Agregar un estilo global temporal para asegurar que las selecciones ocupen todo el espacio
    // y sean completamente visibles incluso después de que termina la selección
    const tempStyle = document.createElement("style");
    tempStyle.id = "temp-selection-fix";
    tempStyle.textContent = `
      .fc-highlight {
        height: 100% !important;
        width: 100% !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        background-color: rgba(135, 201, 71, 0.4) !important;
        border: 3px dashed rgba(135, 201, 71, 0.9) !important;
        box-shadow: 0 0 8px rgba(135, 201, 71, 0.7) !important;
        position: relative !important;
        z-index: 10 !important;
      }
      
      .selection-time-label {
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 100 !important;
        pointer-events: none !important; /* Permite hacer clic a través de las etiquetas */
      }
      
      /* Mejorar la visibilidad de las celdas seleccionadas */
      .fc-selecting-cell, .fc-selecting {
        background-color: rgba(135, 201, 71, 0.3) !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
    `;

    // Eliminar el estilo anterior si existe
    const oldStyle = document.getElementById("temp-selection-fix");
    if (oldStyle) {
      oldStyle.remove();
    }

    // Agregar el nuevo estilo
    document.head.appendChild(tempStyle);

    // Mantener el estilo por más tiempo para asegurar que la selección sea visible
    // incluso después de que termine la interacción
    setTimeout(() => {
      if (document.getElementById("temp-selection-fix")) {
        document.getElementById("temp-selection-fix").remove();
      }
    }, 10000); // Mantener por 10 segundos

    // Asegurarse de que las etiquetas sean visibles incluso después de completar la selección
    setTimeout(() => {
      document.querySelectorAll(".selection-time-label").forEach((label) => {
        label.style.visibility = "visible";
        label.style.opacity = "1";
      });
    }, 100);
  }, 0);
}
