// Función para sembrar datos de ejemplo en la base de datos
const seedInventory = async () => {
  try {
    console.log("No se necesita sembrar datos por ahora.");
    return true;
  } catch (error) {
    console.error("Error al sembrar datos:", error);
    return false;
  }
};

export default seedInventory;
