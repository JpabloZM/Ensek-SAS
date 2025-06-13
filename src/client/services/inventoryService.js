import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory";

// Configuración de axios con el token de autenticación
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener todos los items del inventario
const getAllItems = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al obtener items:", error);
    throw error;
  }
};

// Crear un nuevo item
const addItem = async (item) => {
  try {
    const response = await axios.post(API_URL, item, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al crear item:", error);
    throw error;
  }
};

// Actualizar un item
const updateItem = async (id, item) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, item, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al actualizar item:", error);
    throw error;
  }
};

// Eliminar un item
const deleteItem = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  } catch (error) {
    console.error("Error al eliminar item:", error);
    throw error;
  }
};

export const inventoryService = {
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
};
