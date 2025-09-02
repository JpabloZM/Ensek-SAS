import { db } from "../config/database.js";

const checkDatabaseHealth = async () => {
  try {
    console.log("Checking database health...");

    // Intentar conexión
    const health = await db.healthCheck();

    console.log("Database health status:", JSON.stringify(health, null, 2));

    if (health.status === "healthy") {
      console.log("✅ Database is healthy");
      return true;
    } else {
      console.error("❌ Database is not healthy:", health.error);
      return false;
    }
  } catch (error) {
    console.error("Error checking database health:", error);
    return false;
  }
};

// Script de limpieza de conexiones
const cleanup = async () => {
  try {
    await db.disconnect();
    console.log("Database connections cleaned up");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

// Manejadores de señales para limpieza
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

// Ejecutar si este archivo es llamado directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkDatabaseHealth()
    .then((isHealthy) => {
      process.exit(isHealthy ? 0 : 1);
    })
    .catch((error) => {
      console.error("Health check failed:", error);
      process.exit(1);
    });
}

export { checkDatabaseHealth };
