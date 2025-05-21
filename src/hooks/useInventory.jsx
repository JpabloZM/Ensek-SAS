import { useState, useEffect } from "react";

const mockInventoryItems = [
  {
    id: 1,
    name: "Insecticida MultiAction",
    description: "Insecticida de amplio espectro",
    quantity: 50,
    unit: "litros",
    minStock: 10,
    category: "insecticidas",
  },
  {
    id: 2,
    name: "Raticida Block",
    description: "Cebo rodenticida en bloques",
    quantity: 100,
    unit: "unidades",
    minStock: 20,
    category: "rodenticidas",
  },
];

export const useInventory = () => {
  const [inventory, setInventory] = useState(() => {
    const stored = localStorage.getItem("inventory");
    return stored ? JSON.parse(stored) : mockInventoryItems;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  const getAllItems = async () => {
    try {
      setLoading(true);
      return inventory;
    } catch (error) {
      setError("Error al cargar el inventario");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      setLoading(true);
      const newItem = {
        id: inventory.length + 1,
        ...itemData,
      };
      setInventory([...inventory, newItem]);
      return newItem;
    } catch (error) {
      setError("Error al agregar el item");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      setLoading(true);
      const index = inventory.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Item no encontrado");

      const updatedInventory = [...inventory];
      updatedInventory[index] = { ...updatedInventory[index], ...itemData };
      setInventory(updatedInventory);

      return updatedInventory[index];
    } catch (error) {
      setError("Error al actualizar el item");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      const index = inventory.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Item no encontrado");

      const updatedInventory = inventory.filter((item) => item.id !== id);
      setInventory(updatedInventory);
    } catch (error) {
      setError("Error al eliminar el item");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (id, quantity, type = "add") => {
    try {
      setLoading(true);
      const index = inventory.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Item no encontrado");

      const updatedInventory = [...inventory];
      const currentItem = updatedInventory[index];

      if (type === "add") {
        currentItem.quantity += quantity;
      } else if (type === "subtract") {
        if (currentItem.quantity < quantity) {
          throw new Error("Stock insuficiente");
        }
        currentItem.quantity -= quantity;
      }

      setInventory(updatedInventory);
      return currentItem;
    } catch (error) {
      setError("Error al ajustar el stock");
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
