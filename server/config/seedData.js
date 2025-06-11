import InventoryItem from "../models/inventoryModel.js";

const seedInventory = async () => {
  try {
    // Limpiar la colección existente
    await InventoryItem.deleteMany({});

    // Datos de ejemplo
    const inventoryItems = [
      {
        name: "Café Premium",
        quantity: 50,
        unit: "gr",
        unit_price: 25000,
        minimum_stock: 10,
        description: "Café de origen colombiano",
        status: "available",
      },
      {
        name: "Leche",
        quantity: 5,
        unit: "ml",
        unit_price: 3500,
        minimum_stock: 10,
        description: "Leche entera",
        status: "low_stock",
      },
      {
        name: "Azúcar",
        quantity: 0,
        unit: "gr",
        unit_price: 2000,
        minimum_stock: 5,
        description: "Azúcar refinada",
        status: "out_of_stock",
      },
    ];

    // Insertar datos
    await InventoryItem.insertMany(inventoryItems);

    console.log("Datos de ejemplo insertados correctamente");
  } catch (error) {
    console.error("Error al insertar datos de ejemplo:", error);
  }
};

export default seedInventory;
