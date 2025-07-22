import axios from "axios";

const API_URL = "http://localhost:5001/api/inventory";

const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

const calculateStatus = (quantity, minStock) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity < minStock) return "low_stock";
  return "available";
};

const inventoryService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data;
    } catch (error) {
      throw new Error("Error al obtener el inventario");
    }
  },
  create: async (itemData) => {
    try {
      const data = {
        ...itemData,
        status: calculateStatus(itemData.quantity, itemData.minimum_stock),
      };

      const response = await axios.post(API_URL, data, getAuthConfig());
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with an error
        if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response.data?.missingFields) {
          throw new Error(
            `Campos requeridos: ${error.response.data.missingFields.join(", ")}`
          );
        }
      }
      throw new Error(
        "Error al crear el item: " + (error.message || "Error desconocido")
      );
    }
  },

  update: async (id, itemData) => {
    try {
      const data = {
        ...itemData,
        status: calculateStatus(itemData.quantity, itemData.minimum_stock),
      };

      const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      throw new Error("Error al actualizar el item");
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    } catch (error) {
      throw new Error("Error al eliminar el item");
    }
  },
};

export default inventoryService;
