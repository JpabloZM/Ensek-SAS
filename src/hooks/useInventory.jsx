import { useState, useEffect } from "react";
import inventoryService from "../services/inventoryService";

const calculateStatus = (quantity, minStock) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity < minStock) return "low_stock";
  return "available";
};

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      setLoading(true);
      const newItem = await inventoryService.create(itemData);
      setInventory((prev) => [...prev, newItem]);
      return newItem;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      setLoading(true);
      const updatedItem = await inventoryService.update(id, itemData);
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      await inventoryService.delete(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (id, quantity, type = "add") => {
    try {
      setLoading(true);
      const item = inventory.find((item) => item.id === id);
      if (!item) throw new Error("Item no encontrado");

      const newQuantity =
        type === "add" ? item.quantity + quantity : item.quantity - quantity;

      if (newQuantity < 0) {
        throw new Error("Stock insuficiente");
      }

      const updatedItem = await inventoryService.update(id, {
        ...item,
        quantity: newQuantity,
      });

      setInventory((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );

      return updatedItem;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cargar el inventario al montar el componente
  useEffect(() => {
    getAllItems();
  }, []);

  return {
    inventory,
    getAllItems,
    addItem,
    updateItem,
    deleteItem,
    adjustStock,
    loading,
    error,
  };
};
