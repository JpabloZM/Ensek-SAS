import React, { useState, useCallback } from "react";
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
import { useCalendarApi } from "../../../components/calendar/CalendarApi";
import { useServices } from "../../../hooks/useServices";
import "./Calendar.css";
import "./styles/forms.css";

const Calendar = () => {
  // Hooks
  const { mostrarAlerta } = useAlertas();
  const { getAllServices } = useServices();
  const {
    eventos,
    tecnicos,
    loading: calendarLoading,
    error: calendarError,
    createEvent,
    updateEvent,
    deleteEvent,
    createTechnician,
    updateTechnician,
    deleteTechnician,
  } = useCalendarApi();

  // Estados locales
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ x: 0, y: 0 });
  const [mostrarMenuContextual, setMostrarMenuContextual] = useState(false);
  const [mostrarMenuContextualTecnico, setMostrarMenuContextualTecnico] =
    useState(false);

  // Handlers
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
      preConfirm: () => {
        const nombre = document.getElementById("nombreTecnico").value;
        if (!nombre) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre del técnico",
          });
          return false;
        }
        return nombre;
      },
    });

    if (nombreTecnico) {
      try {
        await createTechnician({
          nombre: nombreTecnico,
          order: tecnicos.length + 1,
        });

        mostrarAlerta({
          icon: "success",
          title: "Técnico Agregado",
          text: "El técnico ha sido agregado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo agregar el técnico",
        });
      }
    }
  };

  // Aquí continuaría el resto de la lógica del calendario...
  // Los métodos handleEventDrop, handleEventReceive, etc., pero usando
  // las funciones de la API (createEvent, updateEvent, deleteEvent) en lugar de
  // manipular el estado local y localStorage

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
              },
              dayGridMonth: {
                type: "dayGrid",
                buttonText: "Mes",
              },
              multiMonthYear: {
                type: "multiMonth",
                buttonText: "Año",
              },
            }}
            resources={tecnicos}
            events={eventos}
            editable={true}
            droppable={true}
            locale={esLocale}
            // ... resto de las props del calendario
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
