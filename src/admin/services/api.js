import axiosInstance from "../../config/axios";

export const inventoryService = {
  getAll: async () => {
    try {
      return await axiosInstance.get("/inventory");
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      return await axiosInstance.post("/inventory", data);
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await axiosInstance.put(`/inventory/${id}`, data);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await axiosInstance.delete(`/inventory/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
