import { useState, useEffect, useCallback } from "react";
import { serviceService } from "../client/services/serviceService";

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllServices = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching all services...");
      const data = await serviceService.getServices();
      console.log("Services fetched:", data);
      setServices(data || []);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError(err.message || "Error desconocido");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Initial services load");
    getAllServices();
  }, [getAllServices]);

  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Enviando datos para crear servicio:", serviceData);

      // Validar que los campos requeridos estén presentes
      const requiredFields = [
        "name",
        "email",
        "phone",
        "document",
        "address",
        "serviceType",
        "preferredDate",
      ];
      const missingFields = requiredFields.filter(
        (field) => !serviceData[field]
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Faltan campos requeridos: ${missingFields.join(", ")}`
        );
      }

      const newService = await serviceService.saveService(serviceData);
      console.log("Servicio creado con éxito:", newService);
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      console.error("Error al crear servicio:", err);
      setError(err.message || "Error al crear servicio");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id, serviceData) => {
    try {
      if (!id) throw new Error("ID de servicio no válido");
      setLoading(true);
      setError(null);
      const updatedService = await serviceService.updateService(
        id,
        serviceData
      );
      setServices((prev) =>
        prev.map((service) => (service._id === id ? updatedService : service))
      );
      return updatedService;
    } catch (err) {
      console.error("Error al actualizar servicio:", err);
      setError(err.message || "Error al actualizar servicio");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id) => {
    try {
      if (!id) throw new Error("ID de servicio no válido");
      setLoading(true);
      setError(null);
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service._id !== id));
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      setError(err.message || "Error al eliminar servicio");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
