import mongoose from "mongoose";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const initializeDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/ensek"
    );
    console.log("MongoDB Connected");

    // Limpiar usuarios existentes
    await User.deleteMany({});
    console.log("Base de datos limpiada");

    // Crear usuario administrador
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
      phone: "123-456-7890",
      address: "123 Admin St",
    });
    console.log("Usuario administrador creado:", adminUser.email);

    // Crear usuario de prueba
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "user123",
      role: "user",
      phone: "987-654-3210",
      address: "456 User Ave",
    });
    console.log("Usuario de prueba creado:", testUser.email);

    // Verificar que los usuarios se crearon correctamente
    const admin = await User.findOne({ email: "admin@test.com" }).select(
      "+password"
    );
    const test = await User.findOne({ email: "test@example.com" }).select(
      "+password"
    );

    console.log("Verificación de usuarios creados:");
    console.log("Admin existe:", !!admin);
    console.log("Test existe:", !!test);

    if (admin) {
      const isAdminPasswordValid = await admin.matchPassword("admin123");
      console.log("Contraseña de admin válida:", isAdminPasswordValid);
    }

    if (test) {
      const isTestPasswordValid = await test.matchPassword("user123");
      console.log("Contraseña de test válida:", isTestPasswordValid);
    }

    console.log("Base de datos inicializada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1);
  }
};

initializeDatabase();
