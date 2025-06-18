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

// Get all services
const getServices = async () => {
  try {
    if (pendingRequest) {
      return pendingRequest;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const cachedData = localStorage.getItem("cachedServices");
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }

    lastRequestTime = Date.now();

    pendingRequest = axios
      .get(API_URL, getAuthConfig())
      .then((response) => {
        localStorage.setItem("cachedServices", JSON.stringify(response.data));
        return response.data;
      })
      .finally(() => {
        setTimeout(() => {
          pendingRequest = null;
        }, MIN_REQUEST_INTERVAL);
      });

    return pendingRequest;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Create a new service
const saveService = async (service) => {
  try {
    const response = await axios.post(API_URL, service);
    const savedService = response.data;

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
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Update a service
const updateService = async (id, updates) => {
  try {
    console.log("Payload for updateService:", updates);
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
    const config = getAuthConfig();
    const response = await axios.delete(`${API_URL}/${serviceId}`, config);

    // Clear cache to force a fresh load
    localStorage.removeItem("cachedServices");

    // Reset the request tracking variables
    lastRequestTime = 0;
    pendingRequest = null;

    return response.data;
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    if (error.response && error.response.status === 404) {
      // Si el servicio no existe, limpiamos la caché de todos modos
      localStorage.removeItem("cachedServices");
      return { success: true, message: "Servicio eliminado (no existía)" };
    }
    throw error;
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

export const serviceService = {
  getServices,
  saveService,
  updateService,
  deleteService,
  assignTechnician,
};
