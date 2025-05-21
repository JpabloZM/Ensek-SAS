import { useState, useEffect } from "react";

// Initial mock services data
const initialServices = [
  {
    id: 1,
    title: "Control de Plagas",
    description: "Eliminación de plagas en hogares y negocios",
    price: 100000,
    duration: 2,
    status: "available",
  },
  {
    id: 2,
    title: "Fumigación",
    description: "Fumigación preventiva y correctiva",
    price: 150000,
    duration: 3,
    status: "available",
  },
];

export const useServices = () => {
  const [services, setServices] = useState(() => {
    // Try to get services from localStorage, fallback to initial data
    const stored = localStorage.getItem("services");
    return stored ? JSON.parse(stored) : initialServices;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever services change
  useEffect(() => {
    localStorage.setItem("services", JSON.stringify(services));
  }, [services]);

  const getAllServices = async () => {
    try {
      setLoading(true);
      return services;
    } catch (error) {
      setError("Error al cargar los servicios");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData) => {
    try {
      setLoading(true);
      const newService = {
        id: services.length + 1,
        ...serviceData,
      };
      setServices([...services, newService]);
      return newService;
    } catch (error) {
      setError("Error al crear el servicio");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      setLoading(true);
      const index = services.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Servicio no encontrado");

      const updatedServices = [...services];
      updatedServices[index] = { ...updatedServices[index], ...serviceData };
      setServices(updatedServices);

      return updatedServices[index];
    } catch (error) {
      setError("Error al actualizar el servicio");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      setLoading(true);
      const index = services.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Servicio no encontrado");

      const updatedServices = services.filter((s) => s.id !== id);
      setServices(updatedServices);
    } catch (error) {
      setError("Error al eliminar el servicio");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllServices,
    createService,
    updateService,
    deleteService,
    loading,
    error,
  };
};
