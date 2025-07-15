// Service request controller
import ServiceRequest from "../models/serviceRequestModel.js";
import ServiceModel from "../models/ServiceModel.js";
import User from "../models/User.js"; // Import User model
import mongoose from "mongoose";

// Verificar que los modelos usen las colecciones correctas
console.log("ServiceRequest collection:", ServiceRequest.collection.name);
console.log("ServiceModel collection:", ServiceModel.collection.name);

// Crear proxy para forzar el uso de la colección correcta en ServiceRequest
const originalCreate = ServiceRequest.create;
ServiceRequest.create = async function (...args) {
  console.log("ServiceRequest.create intercepted!");
  console.log("Collection being used:", this.collection.name);

  // Si no está usando la colección correcta, usar un modelo directo
  if (this.collection.name !== "servicesrequests") {
    console.warn(
      "¡ALERTA! ServiceRequest no está usando la colección correcta, forzando uso de servicesrequests"
    );
    // Crear un modelo que apunte directamente a la colección correcta
    const DirectServiceRequest = mongoose.model(
      "DirectServiceRequest" + Date.now(), // Nombre único para evitar colisiones
      this.schema,
      "servicesrequests"
    );
    return await DirectServiceRequest.create(...args);
  }

  // Usar el método original si la colección es correcta
  return await originalCreate.apply(this, args);
};

// Exportar los modelos para diagnóstico
export { ServiceRequest, ServiceModel };

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

// @desc    Get all services and service requests
// @route   GET /api/services
// @access  Protected
export const getServices = async (req, res) => {
  try {
    console.log("=== GET SERVICES - INICIO ===");

    // Get both confirmed services (legacy) and all service requests
    // Usar un modelo forzado para ServiceRequest para asegurar que esté usando la colección correcta
    const ForcedServiceRequest = mongoose.model(
      "ForcedServiceRequest_Get_" + Date.now(),
      ServiceRequest.schema,
      "servicesrequests"
    );

    const [services, serviceRequests] = await Promise.all([
      ServiceModel.find().sort({ createdAt: -1 }),
      ForcedServiceRequest.find().sort({ createdAt: -1 }), // Usar el modelo forzado
    ]);

    // Format service requests to match service structure for frontend compatibility
    const formattedRequests = serviceRequests.map((req) => ({
      _id: req._id,
      name: req.name,
      email: req.email,
      phone: req.phone,
      document: req.document || "N/A", // Use document field if exists or placeholder
      address: req.address,
      serviceType: req.serviceType,
      description: req.description,
      preferredDate: req.preferredDate,
      status: req.status,
      technician: req.technician || null,
      technicians: req.technicians || [],
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      isServiceRequest: true, // Flag to identify this is from ServiceRequest collection
      clientName: req.name, // Additional field for compatibility with the frontend
    }));

    // Combine both lists and sort by creation date (newest first)
    const allServices = [...services, ...formattedRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(
      `Found ${services.length} legacy services and ${serviceRequests.length} service requests`
    );
    console.log("=== GET SERVICES - ÉXITO ===");

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
// @desc    Create a new service request (unified API endpoint)
// @route   POST /api/services
// @access  Public
export const createService = async (req, res) => {
  try {
    console.log("=== CREATE SERVICE - INICIO ===");
    console.log("Request body:", req.body);

    const {
      name,
      email,
      phone,
      document,
      address,
      serviceType,
      description,
      preferredDate,
      technician,
      technicians,
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
      console.log("Missing fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        missingFields,
      });
    }

    // Create service data
    const serviceData = {
      name,
      email,
      phone,
      document: document || "pending",
      address,
      serviceType,
      description: description || "",
      preferredDate: new Date(preferredDate),
      status: "pending",
      technician: technician || null,
      technicians: technicians || [],
    };

    console.log("Service data to create:", serviceData);

    // SOLUCIÓN FORZADA: Crear un modelo que apunte directamente a la colección servicesrequests
    console.log("FORZANDO USO DE COLECCIÓN servicesrequests");

    // Crear un modelo temporal que garantice el uso de la colección correcta
    const ForcedServiceRequest = mongoose.model(
      "ForcedServiceRequest_" + Date.now(), // Nombre único para evitar colisiones
      ServiceRequest.schema,
      "servicesrequests" // Forzar la colección correcta
    );

    // Verificar el nombre de la colección antes de crear
    console.log(
      "ForcedServiceRequest collection name:",
      ForcedServiceRequest.collection.name
    );

    // Crear el servicio con el modelo forzado
    const service = await ForcedServiceRequest.create(serviceData);

    console.log("Service created in collection:", service.collection.name);
    console.log("Service created successfully:", service);
    console.log("Service ID:", service._id);
    console.log("Service collection:", service.collection.name);

    // Verificar que el servicio fue creado correctamente
    if (service) {
      const response = {
        success: true,
        service: service,
        model: "ServiceRequest", // Incluir el modelo usado para verificar
        collection: service.collection.name, // Nombre de la colección
      };
      console.log("Sending response:", response);
      console.log("=== CREATE SERVICE - ÉXITO ===");
      res.status(201).json(response);
    } else {
      console.log("Service creation returned null/undefined");
      res.status(400).json({
        success: false,
        message: "Invalid service data",
      });
    }
  } catch (error) {
    console.error("=== CREATE SERVICE - ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Check if it's a validation error
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
      // Usar los datos de req.body para evitar errores si serviceData no está definido
      console.error("serviceType recibido:", req.body?.serviceType);
      console.error(
        "Tipos permitidos en ServiceRequest:",
        ServiceRequest.schema.path("serviceType").enumValues
      );

      return res.status(400).json({
        success: false,
        message: "Error de validación en campos del servicio",
        error: error.message,
        details: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
          receivedValue: req.body[key], // Usar req.body en lugar de serviceData
          allowedValues:
            key === "serviceType"
              ? ServiceRequest.schema.path("serviceType").enumValues
              : null,
        })),
      });
    }

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

    // Buscar el servicio en ambos modelos
    const { service: existingService, modelUsed } = await searchServiceById(
      req.params.id
    );

    if (!existingService) {
      return res.status(404).json({
        message: "Servicio no encontrado en ninguna colección",
        success: false,
      });
    }

    console.log(`Actualizando servicio en ${modelUsed}`);

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

    // Actualizar en el modelo correcto
    let service;

    if (modelUsed === "ServiceRequest") {
      service = await ServiceRequest.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      service = await ServiceModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    console.log("Updated service response:", service);
    if (!service) {
      return res.status(500).json({
        message: "Error al actualizar el servicio",
        success: false,
      });
    }

    res.json({
      success: true,
      service,
      modelUsed,
    });
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

    // Buscar el servicio y obtener el modelo usado
    const { service, modelUsed } = await searchServiceById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado en ninguna colección",
      });
    }

    // Use findByIdAndDelete for atomic operation con el modelo correcto
    console.log(`Eliminando servicio de la colección ${modelUsed}`);
    const deletedService =
      modelUsed === "ServiceRequest"
        ? await ServiceRequest.findByIdAndDelete(id)
        : await ServiceModel.findByIdAndDelete(id);

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
    const { service, modelUsed } = await searchServiceById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Servicio no encontrado en ninguna colección",
      });
    }

    // Indicar de qué colección proviene el servicio
    const result = {
      ...service.toObject(),
      _collection: service.collection.name,
      _model: modelUsed,
    };

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el servicio", error: error.message });
  }
};

export const assignTechnicianToService = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // Validar el ID del técnico
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({
        message: "ID de técnico inválido",
        success: false,
      });
    }

    const technicianObjectId = new mongoose.Types.ObjectId(technicianId);

    // Buscar el servicio en ambos modelos
    const { service: existingService, modelUsed } = await searchServiceById(
      req.params.id
    );

    if (!existingService) {
      return res.status(404).json({
        message: "Servicio no encontrado en ninguna colección",
        success: false,
      });
    }

    // Actualizar en el modelo correcto
    console.log(`Asignando técnico al servicio en ${modelUsed}`);
    const service =
      modelUsed === "ServiceRequest"
        ? await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            {
              technician: technicianObjectId,
              technicians: [technicianObjectId], // También actualizar el array de técnicos
            },
            { new: true, runValidators: true }
          )
        : await ServiceModel.findByIdAndUpdate(
            req.params.id,
            {
              technician: technicianObjectId,
              technicians: [technicianObjectId], // También actualizar el array de técnicos
            },
            { new: true, runValidators: true }
          );

    if (!service) {
      return res.status(500).json({
        message: "Error al actualizar el servicio",
        success: false,
      });
    }

    res.json({
      success: true,
      service,
      modelUsed,
    });
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

// Función utilitaria para buscar un servicio en ambos modelos
const searchServiceById = async (id) => {
  console.log(`Buscando servicio con ID ${id} en ambos modelos`);
  console.log(`ServiceRequest colección: ${ServiceRequest.collection.name}`);
  console.log(`ServiceModel colección: ${ServiceModel.collection.name}`);

  // Validar formato de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("ID de servicio inválido");
  }

  try {
    // Primero buscar en ServiceRequest (modelo correcto)
    let service = await ServiceRequest.findById(id);
    let modelUsed = "ServiceRequest";

    // Si no se encuentra, intentar con el modelo antiguo
    if (!service) {
      console.log(
        `Servicio ${id} no encontrado en ServiceRequest, buscando en ServiceModel...`
      );
      service = await ServiceModel.findById(id);
      if (service) {
        modelUsed = "ServiceModel";
        console.log(
          `ADVERTENCIA: Servicio encontrado en el modelo antiguo (${modelUsed})`
        );
      }
    }

    if (service) {
      console.log(
        `Servicio encontrado en ${modelUsed}, colección: ${service.collection.name}`
      );
      return { service, modelUsed };
    }

    console.log(`Servicio ${id} no encontrado en ninguna colección`);
    return { service: null, modelUsed: null };
  } catch (error) {
    console.error(`Error al buscar servicio ${id}:`, error);
    throw error;
  }
};

// @desc    Diagnóstico para verificar las colecciones y modelos
// @route   GET /api/services/check-models
// @access  Private
export const checkModels = async (req, res) => {
  try {
    // Verificar la configuración de los modelos
    console.log("=== DIAGNÓSTICO DE MODELOS ===");

    // Información sobre los modelos
    const serviceModelInfo = {
      name: ServiceModel.modelName,
      collection: ServiceModel.collection.name,
    };

    const serviceRequestInfo = {
      name: ServiceRequest.modelName,
      collection: ServiceRequest.collection.name,
    };

    // Contar documentos en cada colección
    const serviceCount = await ServiceModel.countDocuments();
    const requestCount = await ServiceRequest.countDocuments();

    // Verificar creación directa en la colección correcta
    const testData = {
      name: "TEST_SERVICE_" + Date.now(),
      email: "test@example.com",
      phone: "1234567890",
      address: "Test Address",
      serviceType: "other",
      description: "Test service creation",
      preferredDate: new Date(),
      status: "pending",
    };

    // Crear un documento directamente en la colección servicesrequests
    const directModel = mongoose.model(
      "DirectServiceRequest",
      new mongoose.Schema({}),
      "servicesrequests"
    );
    const directDoc = new directModel(testData);
    const directResult = await directDoc.save();

    // Crear con el modelo ServiceRequest normal
    const normalDoc = new ServiceRequest(testData);
    const normalResult = await normalDoc.save();

    // Eliminar los documentos de prueba
    await directModel.findByIdAndDelete(directResult._id);
    await ServiceRequest.findByIdAndDelete(normalResult._id);

    res.json({
      success: true,
      models: {
        serviceModel: serviceModelInfo,
        serviceRequest: serviceRequestInfo,
      },
      counts: {
        services: serviceCount,
        serviceRequests: requestCount,
      },
      testResults: {
        directInsert: {
          collection: directResult.collection.name,
          modelName: directModel.modelName,
        },
        normalInsert: {
          collection: normalResult.collection.name,
          modelName: ServiceRequest.modelName,
        },
      },
    });
  } catch (error) {
    console.error("Error en diagnóstico de modelos:", error);
    res.status(500).json({
      success: false,
      message: "Error al realizar diagnóstico",
      error: error.message,
    });
  }
};
