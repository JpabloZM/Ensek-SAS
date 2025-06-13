import { useState, useEffect } from "react";
import { serviceService } from "../client/services/serviceService";

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar servicios al montar el componente
  useEffect(() => {
    getAllServices();
  }, []);

  // Obtener todos los servicios
  const getAllServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo servicio
  const createService = async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const newService = await serviceService.saveService(serviceData);
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      console.error("Error al crear servicio:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un servicio
  const updateService = async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedService = await serviceService.updateService(id, serviceData);
      setServices((prev) =>
        prev.map((service) => (service._id === id ? updatedService : service))
      );
      return updatedService;
    } catch (err) {
      console.error("Error al actualizar servicio:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un servicio
  const deleteService = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service._id !== id));
      return true;
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    getAllServices,
    createService,
    updateService,
    deleteService,
  };
};
