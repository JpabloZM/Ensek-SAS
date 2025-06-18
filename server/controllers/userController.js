// User controller
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Log mongoose connection status
console.log("Mongoose connection state:", mongoose.connection.readyState);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      res.json({
        success: true,
        user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      // Only update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({
        success: true,
        message: "User removed",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all technicians
// @route   GET /api/users/technicians
// @access  Private/Admin
export const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" }).select(
      "-password"
    );

    res.json({
      success: true,
      count: technicians.length,
      technicians,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new technician
// @route   POST /api/users/technicians
// @access  Private/Admin
export const createTechnician = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validar campos requeridos
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione todos los campos requeridos",
      });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese correo electrónico",
      });
    } // Crear el nuevo técnico
    const technician = new User({
      name,
      email,
      phone,
      role: "technician",
      password: Math.random().toString(36).slice(-8), // Generar contraseña aleatoria
    });

    const createdTechnician = await technician.save();

    res.status(201).json({
      success: true,
      technician: {
        _id: createdTechnician._id,
        name: createdTechnician.name,
        email: createdTechnician.email,
        phone: createdTechnician.phone,
        specialty: createdTechnician.specialty,
        role: createdTechnician.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al crear el técnico",
      error: error.message,
    });
  }
};

// @desc    Get technician by ID
// @route   GET /api/users/technicians/:id
// @access  Private/Admin
export const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("[getTechnicianById] Request received:", {
      id: id,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
    });

    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("[getTechnicianById] Invalid ID format:", id);
      return res.status(400).json({
        success: false,
        message: "Formato de ID inválido",
        details: "El ID proporcionado no tiene el formato correcto de MongoDB",
      });
    }

    const technician = await User.findOne({
      _id: id,
      role: "technician",
    }).select("-password");

    console.log("[getTechnicianById] Database query result:", {
      found: !!technician,
      id: id,
      technicianId: technician?._id?.toString(),
    });

    if (!technician) {
      console.log("[getTechnicianById] Technician not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Técnico no encontrado",
        details: `No se encontró ningún técnico con el ID: ${id}`,
      });
    }

    console.log(
      "[getTechnicianById] Sending successful response for technician:",
      {
        id: technician._id,
        name: technician.name,
      }
    );

    res.json({
      success: true,
      technician: {
        id: technician._id,
        _id: technician._id, // Incluir ambos formatos para compatibilidad
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        role: technician.role,
      },
    });
  } catch (error) {
    console.error("[getTechnicianById] Error details:", {
      message: error.message,
      stack: error.stack,
      mongooseError:
        error.name === "CastError" ? "Invalid ID format" : undefined,
      id: req.params.id,
    });

    res.status(500).json({
      success: false,
      message: "Error al obtener el técnico",
      error: error.message,
      details:
        error.name === "CastError"
          ? "ID inválido"
          : "Error interno del servidor",
    });
  }
};

// @desc    Update technician
// @route   PUT /api/users/technicians/:id
// @access  Private/Admin
export const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    console.log("\n=== Update Technician ===");
    console.log({
      id,
      body: req.body,
      url: req.originalUrl,
    });

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de técnico inválido",
      });
    }

    // Check if technician exists
    const existingTechnician = await User.findOne({
      _id: id,
      role: "technician",
    });

    if (!existingTechnician) {
      return res.status(404).json({
        success: false,
        message: "Técnico no encontrado",
      });
    }

    // Update technician
    const updatedTechnician = await User.findOneAndUpdate(
      { _id: id, role: "technician" },
      {
        name,
        email,
        phone,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Técnico actualizado correctamente",
      technician: updatedTechnician,
    });
  } catch (error) {
    console.error("Error updating technician:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el técnico",
      error: error.message,
    });
  }
};

// @desc    Delete technician
// @route   DELETE /api/users/technicians/:id
// @access  Private/Admin
export const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("\n=== Delete Technician ===");
    console.log({
      id,
      url: req.originalUrl,
    });

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de técnico inválido",
      });
    }

    // Check if technician exists
    const technician = await User.findOne({
      _id: id,
      role: "technician",
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Técnico no encontrado",
      });
    }

    // Delete technician
    await User.deleteOne({ _id: id, role: "technician" });

    return res.json({
      success: true,
      message: "Técnico eliminado correctamente",
      data: {
        id: technician._id,
        name: technician.name,
      },
    });
  } catch (error) {
    console.error("Error deleting technician:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el técnico",
      error: error.message,
    });
  }
};
