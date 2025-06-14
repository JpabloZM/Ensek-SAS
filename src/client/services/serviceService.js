import axios from "axios";

const API_URL = "http://localhost:5000/api/services";

// Keep track of the last request time to implement simple request throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds minimum between requests
let pendingRequest = null; // Store the pending promise to avoid duplicate concurrent requests

// Configuración de axios con el token de autenticación
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

// Obtener todos los servicios
const getServices = async () => {
  try {
    // If there's already a pending request, return it instead of creating a new one
    if (pendingRequest) {
      console.log("Using existing pending request");
      return pendingRequest;
    }
    
    // Throttle API requests to prevent overloading the server
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.log(`Request throttled. Time since last request: ${timeSinceLastRequest}ms`);
      // If we have cached data, return it
      const cachedData = localStorage.getItem("cachedServices");
      if (cachedData) {
        console.log("Returning cached data");
        return JSON.parse(cachedData);
      }
      // Otherwise wait the remaining time
      await new Promise(resolve => 
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    // Check if user is logged in
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("Usuario no autenticado. Por favor inicie sesión.");
    }

    lastRequestTime = Date.now(); // Update the last request time
    
    // Create the promise and store it
    pendingRequest = axios.get(API_URL, getAuthConfig())
      .then(response => {
        // Cache the successful response
        localStorage.setItem("cachedServices", JSON.stringify(response.data));
        return response.data;
      })
      .finally(() => {
        // Clear the pending request reference after completion (success or error)
        setTimeout(() => {
          pendingRequest = null;
        }, MIN_REQUEST_INTERVAL); // Keep the reference for at least the throttle interval
      });
    
    return pendingRequest;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      console.warn("Token inválido o expirado. Redireccionar a login...");
    }
    
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Crear un nuevo servicio
const saveService = async (service) => {
  try {
    const response = await axios.post(API_URL, service);
    return response.data;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw error;
  }
};

// Actualizar un servicio
const updateService = async (id, updates) => {
  try {
    // Check if user is logged in
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("Usuario no autenticado. Por favor inicie sesión.");
    }
    
    const response = await axios.put(
      `${API_URL}/${id}`,
      updates,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      console.warn("Token inválido o expirado. Redireccionar a login...");
    }
    
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Eliminar un servicio
const deleteService = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    throw error;
  }
};

export const serviceService = {
  getServices,
  saveService,
  updateService,
  deleteService,
};
