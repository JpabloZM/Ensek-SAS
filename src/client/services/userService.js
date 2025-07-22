import axios from "axios";

const API_URL = "http://localhost:5001/api/users";

// Get auth config with token
const getAuthConfig = () => {
  const userString = localStorage.getItem("user");
  let token = null;
  let user = null;

  if (userString) {
    try {
      user = JSON.parse(userString);
      token = user.token;
      console.log("Auth info found:", {
        token: token ? "Present" : "Missing",
        userId: user._id,
        role: user.role,
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
      throw new Error("Error al obtener datos de autenticación");
    }
  } else {
    console.error("No user data found in localStorage");
    throw new Error("No se encontraron datos de autenticación");
  }

  if (!token) {
    throw new Error("Token de autenticación no encontrado");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    validateStatus: function (status) {
      return status >= 200 && status < 500; // No rechazar promesas por 4xx
    },
  };

  console.log("Request config prepared:", {
    headers: {
      Authorization: "Bearer [TOKEN]",
      "Content-Type": config.headers["Content-Type"],
      Accept: config.headers["Accept"],
    },
  });

  return config;
};

// Get all technicians
const getTechnicians = async () => {
  try {
    const response = await axios.get(`${API_URL}/technicians`, getAuthConfig());
    return response.data.technicians;
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Get all users
const getUsers = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data.users;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Create a new technician
const createTechnician = async (technicianData) => {
  try {
    const config = getAuthConfig();
    console.log("Creating technician with data:", technicianData);
    console.log("Using config:", config);
    const response = await axios.post(
      `${API_URL}/technicians`,
      technicianData,
      config
    );
    console.log("Technician created successfully:", response.data);
    return response.data.technician;
  } catch (error) {
    console.error("Error al crear técnico:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Update a technician
const updateTechnician = async (technicianId, technicianData) => {
  try {
    console.log("Updating technician:", {
      id: technicianId,
      data: technicianData,
    });
    const config = getAuthConfig();
    const response = await axios.put(
      `${API_URL}/technicians/${technicianId}`,
      technicianData,
      config
    );
    console.log("Technician updated successfully:", response.data);
    return response.data.technician;
  } catch (error) {
    console.error("Error al actualizar técnico:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Delete a technician with enhanced error handling and logging
const deleteTechnician = async (technicianId) => {
  if (!technicianId) {
    throw new Error("ID de técnico no proporcionado");
  }

  try {
    const config = getAuthConfig();
    const url = `${API_URL}/technicians/${technicianId}`;

    console.log("Iniciando eliminación de técnico:", {
      id: technicianId,
      url,
      method: "DELETE",
      headers: {
        ...config.headers,
        "Cache-Control": "no-cache",
      },
    });

    const response = await axios({
      method: "DELETE",
      url,
      headers: {
        ...config.headers,
        "Cache-Control": "no-cache",
      },
    });

    console.log("Respuesta del servidor:", {
      status: response.status,
      data: response.data,
    });

    if (response.status === 200 && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Error al eliminar el técnico");
    }
  } catch (error) {
    console.error("Error detallado al eliminar técnico:", {
      id: technicianId,
      error: error.message,
      response: {
        data: error.response?.data,
        status: error.response?.status,
      },
      request: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });

    throw (
      error.response?.data?.message ||
      error.message ||
      "Error al eliminar el técnico"
    );
  }
};

// Get technician by ID
const getTechnicianById = async (technicianId) => {
  try {
    // Check if we received a string ID or an object with _id
    const actualId =
      typeof technicianId === "string"
        ? technicianId
        : technicianId._id || technicianId.id;

    console.log("[getTechnicianById] Starting request:", {
      originalId: technicianId,
      processedId: actualId,
      url: `${API_URL}/technicians/${actualId}`,
    });

    const config = getAuthConfig();
    console.log("[getTechnicianById] Request configuration:", {
      headers: config.headers,
      method: "GET",
      url: `${API_URL}/technicians/${actualId}`,
    });

    const response = await axios.get(
      `${API_URL}/technicians/${actualId}`,
      config
    );
    console.log("[getTechnicianById] Response received:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });

    return response.data.technician;
  } catch (error) {
    console.error("[getTechnicianById] Request failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      technicianId: technicianId, // Log the original ID for debugging
    });

    // If it's a 404, throw a more specific error
    if (error.response?.status === 404) {
      throw new Error("Técnico no encontrado");
    }

    // If it's a 401, it might be an authentication issue
    if (error.response?.status === 401) {
      throw new Error("No autorizado - Por favor inicie sesión nuevamente");
    }

    throw (
      error.response?.data?.message ||
      error.message ||
      "Error desconocido al obtener el técnico"
    );
  }
};

const userService = {
  getTechnicians,
  getUsers,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getTechnicianById,
};

export { userService };
