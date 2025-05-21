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

  const [technicians, setTechnicians] = useState(() => {
    const stored = localStorage.getItem("calendar_technicians");
    return stored ? JSON.parse(stored) : initialTechnicians;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("calendar_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("calendar_technicians", JSON.stringify(technicians));
  }, [technicians]);

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

  const deleteTechnician = async (techId) => {
    try {
      setLoading(true);
      setTechnicians((prev) => prev.filter((tech) => tech.id !== techId));
    } catch (error) {
      setError("Error al eliminar el técnico");
      throw error;
    } finally {
      setLoading(false);
    }
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
