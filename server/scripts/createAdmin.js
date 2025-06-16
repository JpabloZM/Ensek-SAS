import { config } from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";

// Load environment variables
config();

const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@ensek.com" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@ensek.com",
      password: "Admin123456",
      role: "admin",
    });

    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
