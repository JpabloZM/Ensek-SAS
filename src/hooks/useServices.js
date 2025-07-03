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

      // Check if we have cached services and not forcing a refresh
      const cachedServices = localStorage.getItem("cachedServices");
      if (!force && cachedServices) {
        try {
          const parsedServices = JSON.parse(cachedServices);
          console.log("Using cached services:", parsedServices);
          setServices(parsedServices || []);

          // Fetch in the background to update cache
          serviceService
            .getServices()
            .then((freshData) => {
              console.log("Background refresh of services:", freshData);
              setServices(freshData || []);
              localStorage.setItem(
                "cachedServices",
                JSON.stringify(freshData || [])
              );
            })
            .catch((e) => {
              console.error("Background fetch error:", e);
            });

          setLoading(false);
          return;
        } catch (parseError) {
          console.error("Error parsing cached services:", parseError);
          // Continue with fetching if parsing fails
        }
      }

      console.log("Fetching all services from server...");
      const data = await serviceService.getServices();
      console.log("Services fetched:", data);
      setServices(data || []);

      // Cache the services
      localStorage.setItem("cachedServices", JSON.stringify(data || []));
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError(err.message || "Error desconocido");

      // Try to use cached data even if fetch fails
      const cachedServices = localStorage.getItem("cachedServices");
      if (cachedServices) {
        try {
          const parsedServices = JSON.parse(cachedServices);
          console.log(
            "Using cached services after fetch error:",
            parsedServices
          );
          setServices(parsedServices || []);
        } catch (parseError) {
          console.error("Error parsing cached services:", parseError);
          setServices([]);
        }
      } else {
        setServices([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Initial services load");

    // Try to use cached services immediately if available
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      try {
        const parsedServices = JSON.parse(cachedServices);
        console.log("Using cached services on initial load:", parsedServices);
        setServices(parsedServices || []);
      } catch (parseError) {
        console.error(
          "Error parsing cached services on initial load:",
          parseError
        );
      }
    }

    // Then load fresh data from the server
    getAllServices(false);
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

      // Update services state and cache
      const updatedServices = [...services, newService];
      setServices(updatedServices);

      // Update localStorage cache
      localStorage.setItem("cachedServices", JSON.stringify(updatedServices));

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

      console.log(`Updating service with ID: ${id}`, serviceData);
      const updatedService = await serviceService.updateService(
        id,
        serviceData
      );

      // Update services state
      const updatedServices = services.map((service) =>
        service._id === id ? updatedService : service
      );

      setServices(updatedServices);

      // Update localStorage cache
      localStorage.setItem("cachedServices", JSON.stringify(updatedServices));
      console.log("Services updated and cached:", updatedServices);

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

      console.log(`Deleting service with ID: ${id}`);
      await serviceService.deleteService(id);

      // Update services state
      const updatedServices = services.filter((service) => service._id !== id);
      setServices(updatedServices);

      // Update localStorage cache
      localStorage.setItem("cachedServices", JSON.stringify(updatedServices));
      console.log("Services after deletion and cached:", updatedServices);
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
