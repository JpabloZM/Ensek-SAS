// Service request controller
import ServiceRequest from "../models/serviceRequestModel.js";
import ServiceModel from "../models/ServiceModel.js";
import User from "../models/User.js"; // Import User model
import mongoose from "mongoose";

// @desc    Create a new service request
// @route   POST /api/services/request
// @access  Public
export const createServiceRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      serviceType,
      description,
      preferredDate,
    } = req.body;

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      user: req.user ? req.user._id : null,
      name,
      email,
      phone,
      address,
      serviceType,
      description,
      preferredDate: new Date(preferredDate),
    });

    if (serviceRequest) {
      res.status(201).json({
        success: true,
        serviceRequest,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid service request data",
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

// @desc    Get all service requests
// @route   GET /api/services/requests
// @access  Private/Admin
export const getServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({})
      .sort({ createdAt: -1 }) // Sort by most recent
      .populate("user", "name email");

    res.json({
      success: true,
      count: serviceRequests.length,
      serviceRequests,
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

// @desc    Get service request by ID
// @route   GET /api/services/requests/:id
// @access  Private
export const getServiceRequestById = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(
      req.params.id
    ).populate("user", "name email");

    // Check if service request exists
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    // Check if user is admin or the owner of the service request
    if (
      req.user.role !== "admin" &&
      serviceRequest.user &&
      serviceRequest.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this service request",
      });
    }

    res.json({
      success: true,
      serviceRequest,
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

// @desc    Update service request status
// @route   PUT /api/services/requests/:id/status
// @access  Private/Admin
export const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    serviceRequest.status = status;
    serviceRequest.notes = req.body.notes || serviceRequest.notes;

    const updatedServiceRequest = await serviceRequest.save();

    res.json({
      success: true,
      serviceRequest: updatedServiceRequest,
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

export const getServices = async (req, res) => {
  try {
    const services = await ServiceModel.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Public
export const createService = async (req, res) => {
  try {
    console.log('Creating service with data:', req.body);
    
    const {
      name,
      email,
      phone,
      document,
      address,
      serviceType,
      description,
      preferredDate,
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'document', 'address', 'serviceType', 'preferredDate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        missingFields
      });
    }

    // Create service
    const service = await ServiceModel.create({
      name,
      email,
      phone,
      document,
      address,
      serviceType,
      description,
      preferredDate: new Date(preferredDate),
      status: 'pending'
    });

    if (service) {
      res.status(201).json({
        success: true,
        service
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid service data"
      });
    }
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: "Error al crear el servicio",
      error: error.message
    });
  }
};

export const updateService = async (req, res) => {
  try {
    console.log("Updating service:", req.params.id, req.body);

    // Validate service ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID de servicio inválido",
        details: "El ID proporcionado no es un ObjectId válido de MongoDB",
      });
    }

    // Handle technician assignment
    if (req.body.technician) {
      // Validate technician ID format
      if (!mongoose.Types.ObjectId.isValid(req.body.technician)) {
        return res.status(400).json({
          message: "ID de técnico inválido",
          details: "El ID del técnico no es un ObjectId válido de MongoDB",
        });
      }

      const technicianUser = await User.findOne({
        _id: req.body.technician,
        role: "technician",
      });

      if (!technicianUser) {
        return res.status(400).json({
          message: "Técnico no encontrado o rol inválido",
          details:
            "El técnico especificado no existe o no tiene el rol correcto",
        });
      }

      req.body.technician = new mongoose.Types.ObjectId(technicianUser._id);
    }
    const service = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log("Updated service response:", service);
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar el servicio",
      error: error.message,
    });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete service with ID:", id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de servicio inválido",
      });
    }

    // Find the service first
    const service = await ServiceModel.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    // Use findByIdAndDelete for atomic operation
    const deletedService = await ServiceModel.findByIdAndDelete(id);
    console.log("Delete operation result:", deletedService);

    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Error al eliminar el servicio",
      });
    }

    console.log("Service successfully deleted with ID:", id);
    return res.status(200).json({
      success: true,
      message: "Servicio eliminado correctamente",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    res.json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el servicio", error: error.message });
  }
};

export const assignTechnicianToService = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // Validate and convert technicianId to ObjectId
    const technicianObjectId = new mongoose.Types.ObjectId(technicianId);

    const service = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { technician: technicianObjectId },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json(service);
  } catch (error) {
    res.status(400).json({
      message: "Error al asignar técnico al servicio",
      error: error.message,
    });
  }
};
