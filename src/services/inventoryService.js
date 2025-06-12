// Datos de ejemplo para el inventario
const mockInventoryItems = [
  {
    id: 1,
    name: "Insecticida MultiAction",
    description: "Insecticida de amplio espectro",
    quantity: 50,
    unit: "litros",
    minStock: 10,
    category: "insecticidas",
    status: "available",
  },
  {
    id: 2,
    name: "Raticida Block",
    description: "Cebo rodenticida en bloques",
    quantity: 100,
    unit: "unidades",
    minStock: 20,
    category: "rodenticidas",
    status: "available",
  },
];

const calculateStatus = (quantity, minStock) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= minStock) return "low_stock";
  return "available";
};

const inventoryService = {
  getAll: async () => {
    try {
      const stored = localStorage.getItem("inventory");
      return stored ? JSON.parse(stored) : mockInventoryItems;
    } catch (error) {
      throw new Error("Error al obtener el inventario");
    }
  },

  create: async (itemData) => {
    try {
      const items = await inventoryService.getAll();
      const newItem = {
        id: items.length + 1,
        ...itemData,
        status: calculateStatus(itemData.quantity, itemData.minStock),
      };
      const updatedItems = [...items, newItem];
      localStorage.setItem("inventory", JSON.stringify(updatedItems));
      return newItem;
    } catch (error) {
      throw new Error("Error al crear el item");
    }
  },

  update: async (id, itemData) => {
    try {
      const items = await inventoryService.getAll();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Item no encontrado");

      const updatedItem = {
        ...items[index],
        ...itemData,
        status: calculateStatus(itemData.quantity, itemData.minStock),
      };
      items[index] = updatedItem;
      localStorage.setItem("inventory", JSON.stringify(items));
      return updatedItem;
    } catch (error) {
      throw new Error("Error al actualizar el item");
    }
  },

  delete: async (id) => {
    try {
      const items = await inventoryService.getAll();
      const updatedItems = items.filter((item) => item.id !== id);
      localStorage.setItem("inventory", JSON.stringify(updatedItems));
    } catch (error) {
      throw new Error("Error al eliminar el item");
    }
  },
};

export default inventoryService;
