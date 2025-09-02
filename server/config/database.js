import mongoose from "mongoose";
import { createMockDb } from "./mockDb.js";

const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: true,
  retryWrites: true,
  connectTimeoutMS: 10000,
};

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.mockDb = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log("Using existing database connection");
        return this.connection;
      }

      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/ensek";

      console.log("Attempting to connect to MongoDB...");
      this.connection = await mongoose.connect(mongoUri, MONGODB_OPTIONS);

      this.isConnected = true;
      console.log(`MongoDB Connected: ${this.connection.connection.host}`);

      // Configurar listeners para eventos de conexión
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      return this.connection;
    } catch (error) {
      console.error("MongoDB Connection Error:", error.message);
      return this.fallbackToMockDb(error);
    }
  }

  async fallbackToMockDb(error) {
    console.log("Falling back to MockDB...");
    try {
      this.mockDb = createMockDb();
      console.log("MockDB initialized successfully");
      return this.mockDb;
    } catch (mockError) {
      throw new Error(
        `Failed to initialize both MongoDB and MockDB. Original error: ${error.message}, MockDB error: ${mockError.message}`
      );
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("Database connection closed");
    }
  }

  // Método para verificar el estado de la conexión
  async healthCheck() {
    try {
      if (this.mockDb) {
        return {
          status: "healthy",
          type: "mockdb",
          message: "Using MockDB fallback",
        };
      }

      if (!this.isConnected) {
        throw new Error("Database not connected");
      }

      await mongoose.connection.db.admin().ping();
      return {
        status: "healthy",
        type: "mongodb",
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }
}

export const db = new DatabaseConnection();
