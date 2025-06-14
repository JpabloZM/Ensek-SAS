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
        // Reset singleton when all instances are unmounted
        console.log("All useServices instances unmounted, resetting singleton");
        serviceCache = null;
      }
    };
  }, []);  const isLoadingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const stableServicesRef = useRef(services); // Initialize with the current services value
    // Obtener todos los servicios (memoized to prevent infinite loops)
  const getAllServices = useCallback(async (force = false) => {
    // Skip if already loading or if initial load is done and we're not forcing
    if (isLoadingRef.current || (initialLoadDoneRef.current && !force)) {
      console.log("Skipping duplicate service request");
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching services data from API...");
      const data = await serviceService.getServices();
      console.log(`✅ Received ${data?.length || 0} services`);
      
      setServices(data);
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error("❌ Error al cargar servicios:", err);
      setError(err.message || 'Error desconocido');
      // Don't clear services array if we already have data
      if (services.length === 0) {
        setServices([]);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Remove services.length dependency to prevent infinite loop
  
  // Load services only once on component mount
  useEffect(() => {
    console.log("🔄 Initial services load");
    if (!initialLoadDoneRef.current) {
      getAllServices();
    }
    
    // Cleanup function
    return () => {
      console.log("🧹 useServices cleanup");
    };
  }, []); // Empty dependency array = run once on mount
  // Crear un nuevo servicio
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

  // Actualizar un servicio
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

  // Eliminar un servicio
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
  }, []);  // Use a deep comparison for services to prevent unnecessary re-renders
  
  // Only update the ref if the services actually changed in a significant way
  useEffect(() => {
    // Always update if either array is empty
    if (!stableServicesRef.current.length || !services.length) {
      stableServicesRef.current = services;
      return;
    }
    
    // Update if the length changed
    if (services.length !== stableServicesRef.current.length) {
      stableServicesRef.current = services;
    } else {
      // Only perform deep comparison if sizes match but references differ
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
    
    // Update the singleton cache with the latest state
    serviceCache = apiObject;
    
    return apiObject;
  }, [loading, error, getAllServices, createService, updateService, deleteService]);
  
  // Store the instance in our serviceCache (singleton pattern)
  serviceCache = api;
  
  return api;
};
