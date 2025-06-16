import { config } from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

// Load environment variables
config();

const fixUsers = async () => {
  try {
    await connectDB();

    console.log("Iniciando verificación de usuarios...");

    // Verificar usuarios predefinidos
    const defaultUsers = [
      {
        name: "Admin",
        email: "admin@test.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "User",
        email: "user@test.com",
        password: "user123",
        role: "user",
      },
    ];

    for (const defaultUser of defaultUsers) {
      console.log(`\nVerificando usuario: ${defaultUser.email}`);

      // Buscar usuario existente
      let user = await User.findOne({ email: defaultUser.email });

      if (user) {
        console.log("Usuario encontrado, actualizando contraseña...");
        // Generar nuevo hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultUser.password, salt);

        // Actualizar usuario
        user = await User.findByIdAndUpdate(
          user._id,
          {
            password: hashedPassword,
            role: defaultUser.role, // Asegurar que el rol sea correcto
          },
          { new: true }
        );
        console.log("Usuario actualizado correctamente");
      } else {
        console.log("Usuario no encontrado, creando nuevo...");
        // Crear nuevo usuario
        user = await User.create(defaultUser);
        console.log("Usuario creado correctamente");
      }
    }

    console.log("\nProceso completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("Error durante el proceso:", error);
    process.exit(1);
  }
};

fixUsers();
