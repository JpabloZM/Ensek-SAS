import axios from "axios";

const API_URL = "http://localhost:5000/api/services";

// Keep track of the last request time to implement simple request throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds minimum between requests
let pendingRequest = null;

// Get auth config with token
const getAuthConfig = () => {
  const userString = localStorage.getItem("user");
  let token = null;

  if (userString) {
    try {
      const user = JSON.parse(userString);
      token = user.token;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all services with improved caching
const getServices = async () => {
  try {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastRequestTime;

    // Check if we need to throttle and use cached data temporarily
    if (elapsedTime < MIN_REQUEST_INTERVAL && pendingRequest) {
      console.log(
        `Request throttled (${elapsedTime}ms < ${MIN_REQUEST_INTERVAL}ms). Using pending request.`
      );
      return pendingRequest;
    }

    // Check if we need to throttle but have cached data
    if (elapsedTime < MIN_REQUEST_INTERVAL) {
      const cachedServices = localStorage.getItem("cachedServices");
      if (cachedServices) {
        console.log(`Request throttled. Using cached services.`);
        const parsed = JSON.parse(cachedServices);

        // Start a background refresh for next time
        pendingRequest = refreshServicesInBackground();

        return parsed;
      }
    }

    // Update the last request time
    lastRequestTime = currentTime;

    // Make the actual API call
    const config = getAuthConfig();
    console.log("Fetching services with config:", config);

    const response = await axios.get(API_URL, config);
    console.log("Services fetched:", response.data);

    // Cache the results
    localStorage.setItem("cachedServices", JSON.stringify(response.data));
    pendingRequest = null;

    return response.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);

    // If fetch fails, try to use cached data
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      console.log("Using cached services after fetch error");
      return JSON.parse(cachedServices);
    }

    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Background refresh function to update cached services
const refreshServicesInBackground = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(API_URL, config);
    console.log("Background refresh successful:", response.data);

    // Cache the results
    localStorage.setItem("cachedServices", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Background refresh error:", error);

    // Return cached data if available
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      return JSON.parse(cachedServices);
    }

    throw error;
  }
};

// Create a new service
const saveService = async (service) => {
  try {
    console.log("Enviando datos al servidor:", service);
    const config = getAuthConfig();
    const response = await axios.post(API_URL, service, config);
    const savedService = response.data.service; // Obtener el servicio de response.data.service

    console.log("Respuesta del servidor:", response.data);

    // Update cache with new service
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      const services = JSON.parse(cachedServices);
      services.push(savedService);
      localStorage.setItem("cachedServices", JSON.stringify(services));
    }

    return savedService;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);

    // Mensaje de error más detallado
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Error al crear el servicio";

    throw new Error(errorMessage);
  }
};

// Update a service
const updateService = async (id, updates) => {
  try {
    // Validate if this is a temporary ID
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a temporary ID (not a MongoDB ObjectId), we need to save it first
      if (id.startsWith("evento-")) {
        id = id.split("-")[1];
      }

      // Check if this is a new service that needs to be saved first
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("Temporary ID detected, creating new service first:", id);

        // Get the existing service from localStorage if available
        const localServices = JSON.parse(
          localStorage.getItem("serviciosPendientes") || "[]"
        );
        const existingService = localServices.find(
          (s) => s.id === id || s.id === `evento-${id}`
        );

        if (!existingService) {
          throw new Error("No se encontró el servicio local");
        }

        // Create a new service with all required fields
        const newService = {
          name: existingService.clientName,
          email: existingService.clientEmail,
          phone: existingService.clientPhone,
          document: existingService.document || "pending",
          address: existingService.address,
          serviceType: existingService.serviceType || existingService.nombre,
          description: existingService.descripcion,
          preferredDate: updates.scheduledStart || new Date().toISOString(),
          status: updates.status || "confirmed",
          technician: updates.technician,
          scheduledStart: updates.scheduledStart,
          scheduledEnd: updates.scheduledEnd,
        };

        console.log("Creating new service with data:", newService);
        const savedService = await saveService(newService);
        return savedService;
      }
    }

    console.log("Updating existing service:", {
      id: id,
      updates: updates,
    });

    const response = await axios.put(
      `${API_URL}/${id}`,
      updates,
      getAuthConfig()
    );

    // Update cache
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      const services = JSON.parse(cachedServices);
      const index = services.findIndex((s) => s._id === id);
      if (index !== -1) {
        services[index] = response.data;
        localStorage.setItem("cachedServices", JSON.stringify(services));
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Delete a service
const deleteService = async (serviceId) => {
  try {
    if (!serviceId) {
      throw new Error("ID de servicio no válido");
    }

    console.log("Deleting service with ID:", serviceId);
    const config = getAuthConfig();

    // Ensure we're using a valid ID format
    const cleanId =
      typeof serviceId === "string"
        ? serviceId.replace("evento-", "")
        : serviceId;
    console.log("Clean ID for deletion:", cleanId);

    const response = await axios.delete(`${API_URL}/${cleanId}`, config);

    // Clear cache to force a fresh load
    localStorage.removeItem("cachedServices");

    // Reset the request tracking variables
    lastRequestTime = 0;
    pendingRequest = null;

    console.log("Delete service response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar servicio:", {
      error,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 404) {
      localStorage.removeItem("cachedServices");
      return { success: true, message: "Servicio eliminado (no existía)" };
    }

    throw (
      error.response?.data?.message ||
      error.message ||
      "Error al eliminar el servicio"
    );
  }
};

// Assign a technician to a service
const assignTechnician = async (serviceId, technicianId) => {
  try {
    const response = await axios.put(
      `${API_URL}/${serviceId}/assign-technician`,
      { technicianId },
      getAuthConfig()
    );

    // Update cache
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      const services = JSON.parse(cachedServices);
      const index = services.findIndex((s) => s._id === serviceId);
      if (index !== -1) {
        services[index] = response.data;
        localStorage.setItem("cachedServices", JSON.stringify(services));
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error al asignar técnico al servicio:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Get all service requests
const getServiceRequests = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/requests`, config);
    return response.data.serviceRequests;
  } catch (error) {
    console.error("Error fetching service requests:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Convert a service request to a service
const convertServiceRequestToService = async (requestId, technicianId) => {
  try {
    const config = getAuthConfig();

    const response = await axios.put(
      `${API_URL}/requests/${requestId}/convert`,
      {
        technician: technicianId,
        document: "1234567890", // Default document
      },
      config
    );

    // Update cache to reflect the change
    const cachedServices = localStorage.getItem("cachedServices");
    if (cachedServices) {
      try {
        const services = JSON.parse(cachedServices);
        // Add the new service to the cache
        services.push(response.data.service);
        localStorage.setItem("cachedServices", JSON.stringify(services));
      } catch (cacheError) {
        console.error("Error updating cache after conversion:", cacheError);
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error converting service request:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

export const serviceService = {
  getServices,
  saveService,
  updateService,
  deleteService,
  assignTechnician,
  getServiceRequests,
  convertServiceRequestToService,
};
