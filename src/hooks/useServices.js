import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { serviceService } from "../client/services/serviceService";

// Create a singleton instance to share state across component instances
let serviceCache = null;
let mountCount = 0;

export const useServices = () => {
  const [services, setServices] = useState(() => serviceCache?.services || []);
  const [loading, setLoading] = useState(() => serviceCache?.loading || false);
  const [error, setError] = useState(() => serviceCache?.error || null);
  
  // Track mount count for cleanup
  useEffect(() => {
    mountCount++;
    return () => {
      mountCount--;
      if (mountCount === 0) {
        serviceCache = null;
      }
    };
  }, []);

  const isLoadingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const stableServicesRef = useRef(services);

  const getAllServices = useCallback(async (force = false) => {
    if (isLoadingRef.current || (initialLoadDoneRef.current && !force)) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await serviceService.getServices();
      setServices(data);
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError(err.message || 'Error desconocido');
      if (services.length === 0) {
        setServices([]);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      getAllServices();
    }
  }, [getAllServices]);

  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const newService = await serviceService.saveService(serviceData);
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      console.error("Error al crear servicio:", err);
      setError(err.message || 'Error al crear servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id, serviceData) => {
    try {
      if (!id) {
        throw new Error('ID de servicio no válido');
      }
      setLoading(true);
      setError(null);
      const updatedService = await serviceService.updateService(id, serviceData);
      setServices((prev) =>
        prev.map((service) => (service._id === id ? updatedService : service))
      );
      return updatedService;
    } catch (err) {
      console.error("Error al actualizar servicio:", err);
      setError(err.message || 'Error al actualizar servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id) => {
    try {
      if (!id) {
        throw new Error('ID de servicio no válido');
      }
      setLoading(true);
      setError(null);
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service._id !== id));
      return true;
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      setError(err.message || 'Error al eliminar servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!stableServicesRef.current.length || !services.length) {
      stableServicesRef.current = services;
      return;
    }
    
    if (services.length !== stableServicesRef.current.length) {
      stableServicesRef.current = services;
    } else {
      const hasChanged = services.some((service, index) => 
        !service || !stableServicesRef.current[index] ||
        service._id !== stableServicesRef.current[index]._id || 
        service.status !== stableServicesRef.current[index].status
      );
      if (hasChanged) {
        stableServicesRef.current = services;
      }
    }
  }, [services]);

  const api = useMemo(() => {
    const apiObject = {
      services: stableServicesRef.current,
      loading,
      error,
      getAllServices,
      createService,
      updateService,
      deleteService,
    };
    
    serviceCache = apiObject;
    return apiObject;
  }, [loading, error, getAllServices, createService, updateService, deleteService]);
  
  return api;
};
