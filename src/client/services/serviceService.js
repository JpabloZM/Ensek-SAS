import axios from "axios";

const API_URL = "http://localhost:5000/api/services";

// Configuración de axios con el token de autenticación
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener todos los servicios
const getServices = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error;
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
    const response = await axios.put(
      `${API_URL}/${id}`,
      updates,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw error;
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
