import { useState, useEffect } from "react";
import { userService } from "../client/services/userService";

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
            email: tech.email,
            phone: tech.phone,
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

  useEffect(() => {
    localStorage.setItem("calendar_events", JSON.stringify(events));
  }, [events]);

  const createTechnician = async (techData) => {
    try {
      setLoading(true);
      // Primero crear el técnico en el backend
      const newTech = await userService.createTechnician({
        name: techData.name,
        email: techData.email,
        phone: techData.phone,
      });

      // Si la creación fue exitosa, actualizar el estado local
      const formattedTech = {
        id: newTech._id,
        title: newTech.name,
        order: technicians.length + 1,
        email: newTech.email,
        phone: newTech.phone,
      };

      setTechnicians((prev) => [...prev, formattedTech]);
      return formattedTech;
    } catch (error) {
      console.error("Error al crear técnico:", error);
      throw new Error(error.message || "Error al crear técnico");
    } finally {
      setLoading(false);
    }
  };

  const updateTechnician = async (techId, techData) => {
    try {
      setLoading(true);
      // Primero actualizar en el backend
      const updatedTech = await userService.updateTechnician(techId, {
        name: techData.name,
        email: techData.email,
        phone: techData.phone,
      });

      // Si la actualización fue exitosa, actualizar el estado local
      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === techId
            ? {
                ...tech,
                title: updatedTech.name,
                email: updatedTech.email,
                phone: updatedTech.phone,
              }
            : tech
        )
      );
    } catch (error) {
      console.error("Error al actualizar técnico:", error);
      throw new Error(error.message || "Error al actualizar técnico");
    } finally {
      setLoading(false);
    }
  };

  const deleteTechnician = async (techId) => {
    try {
      setLoading(true);
      // Llamar a la API para eliminar el técnico
      await userService.deleteTechnician(techId);
      // Solo actualizar el estado si la API fue exitosa
      setTechnicians((prev) => prev.filter((tech) => tech.id !== techId));
      console.log("Técnico eliminado exitosamente:", techId);
    } catch (error) {
      console.error("Error al eliminar técnico:", error);
      throw new Error(error.message || "Error al eliminar técnico");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your existing event handling functions...

  return {
    events,
    technicians,
    loading,
    error,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    // ...other event handlers
  };
}
