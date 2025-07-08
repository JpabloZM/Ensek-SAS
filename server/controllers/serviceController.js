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
    // Get both confirmed services and pending service requests
    const [services, serviceRequests] = await Promise.all([
      ServiceModel.find().sort({ createdAt: -1 }),
      ServiceRequest.find({ status: "pending" }).sort({ createdAt: -1 }),
    ]);

    // Format service requests to match service structure for frontend compatibility
    const formattedRequests = serviceRequests.map((req) => ({
      _id: req._id,
      name: req.name,
      email: req.email,
      phone: req.phone,
      document: "1234567890", // Default document for service requests
      address: req.address,
      serviceType: req.serviceType,
      description: req.description,
      preferredDate: req.preferredDate,
      status: req.status,
      technician: null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      isServiceRequest: true, // Flag to identify this is from ServiceRequest collection
    }));

    // Combine both lists and sort by creation date
    const allServices = [...services, ...formattedRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(
      `Returning ${services.length} services and ${formattedRequests.length} service requests`
    );
    res.json(allServices);
  } catch (error) {
    console.error("Error fetching services:", error);
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
    console.log(
      "Creating service (redirected to service request) with data:",
      req.body
    );

    // We'll now create this as a service request instead of a direct service
    // This change allows all initial service entries to go to the serviceRequests table

    const {
      name,
      email,
      phone,
      document, // We'll store this but it's not used in ServiceRequest
      address,
      serviceType,
      description,
      preferredDate,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "serviceType",
      "preferredDate",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        missingFields,
      });
    }

    // Create service request instead of direct service
    const serviceRequest = await ServiceRequest.create({
      user: req.user ? req.user._id : null,
      name,
      email,
      phone,
      address,
      serviceType,
      description,
      preferredDate: new Date(preferredDate),
      status: "pending",
      notes: document ? `Documento: ${document}` : "",
    });

    if (serviceRequest) {
      res.status(201).json({
        success: true,
        // Return with a service property for backward compatibility
        service: {
          ...serviceRequest.toJSON(),
          _id: serviceRequest._id,
          id: serviceRequest._id,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid service data",
      });
    }
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el servicio",
      error: error.message,
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

    // Preparar objeto de actualización
    const updateData = { ...req.body };

    // Manejar asignación de técnico principal (legado)
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

      updateData.technician = new mongoose.Types.ObjectId(technicianUser._id);
    }

    // Manejar múltiples técnicos
    if (req.body.technicians && Array.isArray(req.body.technicians)) {
      // Validar cada ID de técnico
      const validatedTechnicians = [];

      for (const techId of req.body.technicians) {
        if (!mongoose.Types.ObjectId.isValid(techId)) {
          return res.status(400).json({
            message: "ID de técnico inválido en el array",
            details: `El ID ${techId} no es un ObjectId válido de MongoDB`,
          });
        }

        const techUser = await User.findOne({
          _id: techId,
          role: "technician",
        });

        if (techUser) {
          validatedTechnicians.push(new mongoose.Types.ObjectId(techUser._id));
        } else {
          console.warn(
            `Técnico con ID ${techId} no encontrado o no es técnico`
          );
        }
      }

      // Actualizar con los técnicos validados
      updateData.technicians = validatedTechnicians;

      // Si no hay un técnico principal asignado pero hay técnicos en la lista,
      // asignar el primero como principal para compatibilidad
      if (!updateData.technician && validatedTechnicians.length > 0) {
        updateData.technician = validatedTechnicians[0];
      }
    }

    const service = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// @desc    Convert a service request to a confirmed service
// @route   PUT /api/services/requests/:id/convert
// @access  Private/Admin
export const convertServiceRequestToService = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    // Manejar técnicos múltiples desde la solicitud
    let technicians = [];
    if (req.body.technicians && Array.isArray(req.body.technicians)) {
      technicians = req.body.technicians.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Si hay un técnico principal especificado, asegurarse de que también esté en el array
    if (req.body.technician) {
      const techId = new mongoose.Types.ObjectId(req.body.technician);
      if (!technicians.some((id) => id.toString() === techId.toString())) {
        technicians.push(techId);
      }
    } else if (technicians.length > 0) {
      // Si no hay técnico principal pero hay técnicos en el array, usar el primero como principal
      req.body.technician = technicians[0];
    }

    // Create a new service from the service request data
    const newService = new ServiceModel({
      name: serviceRequest.name,
      email: serviceRequest.email,
      phone: serviceRequest.phone,
      document: req.body.document || "1234567890", // Default document if not provided
      address: serviceRequest.address,
      serviceType: serviceRequest.serviceType,
      description: serviceRequest.description,
      preferredDate: serviceRequest.preferredDate,
      status: "confirmed",
      technician: req.body.technician || null,
      technicians: technicians.length > 0 ? technicians : [],
    });

    // Save the new service
    const savedService = await newService.save();

    // Update the service request status to "converted"
    serviceRequest.status = "completed";
    serviceRequest.notes = `Converted to service ID: ${savedService._id}`;
    await serviceRequest.save();

    res.json({
      success: true,
      message: "Service request converted to service",
      serviceRequest,
      service: savedService,
    });
  } catch (error) {
    console.error("Error converting service request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
