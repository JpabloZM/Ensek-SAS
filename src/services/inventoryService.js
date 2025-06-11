import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory";

// Función para obtener el token del localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

// Configuración de axios con el token
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const inventoryService = {
  // Obtener todos los items
  getAll: async () => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error("Error al obtener el inventario:", error);
      throw error;
    }
  },

  // Obtener un item por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el item ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo item
  create: async (itemData) => {
    try {
      const response = await axios.post(API_URL, itemData, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error("Error al crear el item:", error);
      throw error;
    }
  },

  // Actualizar un item
  update: async (id, itemData) => {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`,
        itemData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el item ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un item
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el item ${id}:`, error);
      throw error;
    }
  },
};

export default inventoryService;
