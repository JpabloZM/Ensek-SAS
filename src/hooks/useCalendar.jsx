import { useState, useEffect } from "react";

const initialTechnicians = [
  { id: "tech1", title: "Juan Pérez", order: 1 },
  { id: "tech2", title: "María López", order: 2 },
  { id: "tech3", title: "Carlos García", order: 3 },
];

const initialEvents = [
  {
    id: 1,
    title: "Fumigación Casa Silva",
    start: "2024-03-21T10:00:00",
    end: "2024-03-21T12:00:00",
    resourceId: "tech1",
    status: "confirmed",
    description: "Fumigación general",
    clientName: "Silva Family",
  },
  {
    id: 2,
    title: "Control de Plagas Edificio Luna",
    start: "2024-03-21T14:00:00",
    end: "2024-03-21T17:00:00",
    resourceId: "tech2",
    status: "pending",
    description: "Control de cucarachas",
    clientName: "Luna Building",
  },
];

export function useCalendar() {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("calendar_events");
    return stored ? JSON.parse(stored) : initialEvents;
  });
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);

  // Cargar técnicos desde la API
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setLoading(true);
        const techniciansData = await userService.getTechnicians();
        setTechnicians(
          techniciansData.map((tech) => ({
            id: tech._id,
            title: tech.name,
            order: tech.order || 0,
          }))
        );
      } catch (err) {
        console.error("Error loading technicians:", err);
        setError("Error al cargar técnicos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();
  }, []); // Solo cargar al montar el componente

  // Efecto para recargar técnicos cuando sea necesario
  useEffect(() => {
    if (shouldReload) {
      const reloadTechnicians = async () => {
        try {
          setLoading(true);
          const techniciansData = await userService.getTechnicians();
          const formattedTechnicians = techniciansData.map((tech) => ({
            id: tech._id,
            title: tech.name,
            order: tech.order || 0,
          }));
          setTechnicians(formattedTechnicians);
          localStorage.setItem(
            "calendar_technicians",
            JSON.stringify(formattedTechnicians)
          );
        } catch (err) {
          console.error("Error reloading technicians:", err);
        } finally {
          setLoading(false);
          setShouldReload(false);
        }
      };

      reloadTechnicians();
    }
  }, [shouldReload]);

  useEffect(() => {
    localStorage.setItem("calendar_events", JSON.stringify(events));
  }, [events]);

  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      const newEvent = {
        id: Date.now(),
        ...eventData,
      };
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      setError("Error al crear el evento");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      setLoading(true);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...eventData } : event
        )
      );
    } catch (error) {
      setError("Error al actualizar el evento");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      setError("Error al eliminar el evento");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTechnician = async (techData) => {
    try {
      setLoading(true);
      const newTech = {
        id: `tech${Date.now()}`,
        order: technicians.length + 1,
        ...techData,
      };
      setTechnicians((prev) => [...prev, newTech]);
      return newTech;
    } catch (error) {
      setError("Error al crear el técnico");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTechnician = async (techId, techData) => {
    try {
      setLoading(true);
      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === techId ? { ...tech, ...techData } : tech
        )
      );
    } catch (error) {
      setError("Error al actualizar el técnico");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función modificada para eliminar técnico
  const deleteTechnician = async (techId) => {
    if (!techId) {
      console.error("ID de técnico no proporcionado");
      throw new Error("Se requiere el ID del técnico");
    }

    try {
      setLoading(true);
      console.log("Iniciando eliminación de técnico:", techId);

      // Llamar a la API para eliminar el técnico
      await userService.deleteTechnician(techId);
      console.log("API call exitoso para eliminar técnico");

      // Cargar los datos actualizados desde el servidor
      const techniciansData = await userService.getTechnicians();
      const formattedTechnicians = techniciansData.map((tech) => ({
        id: tech._id,
        title: tech.name,
        order: tech.order || 0,
      }));

      // Actualizar el estado con los datos frescos del servidor
      setTechnicians(formattedTechnicians);

      console.log("Técnico eliminado y datos actualizados:", {
        deletedId: techId,
        remainingCount: formattedTechnicians.length,
      });
    } catch (error) {
      console.error("Error al eliminar técnico:", {
        techId,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(error.message || "Error al eliminar técnico");
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar una recarga
  const reloadTechnicians = () => {
    setShouldReload(true);
  };

  return {
    events,
    technicians,
    createEvent,
    updateEvent,
    deleteEvent,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    loading,
    error,
  };
}
