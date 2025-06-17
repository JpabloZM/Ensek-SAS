// Service request controller
import ServiceRequest from '../models/serviceRequestModel.js';
import Service from '../models/Service.js';
import User from '../models/User.js'; // Import User model
import mongoose from 'mongoose';

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
        message: 'Invalid service request data',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
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
      .populate('user', 'name email');

    res.json({
      success: true,
      count: serviceRequests.length,
      serviceRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get service request by ID
// @route   GET /api/services/requests/:id
// @access  Private
export const getServiceRequestById = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id).populate(
      'user',
      'name email'
    );

    // Check if service request exists
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // Check if user is admin or the owner of the service request
    if (
      req.user.role !== 'admin' &&
      (serviceRequest.user && serviceRequest.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this service request',
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
      message: 'Server Error',
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
        message: 'Service request not found',
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
      message: 'Server Error',
      error: error.message,
    });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los servicios', error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el servicio', error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    console.log("Updating service:", req.params.id, req.body);
    if (req.body.technician) {
      const technicianUser = await User.findOne({ _id: req.body.technician, role: 'technician' });
      if (!technicianUser) {
        return res.status(400).json({ message: 'Technician not found or invalid role' });
      }
      req.body.technician = new mongoose.Types.ObjectId(technicianUser._id); // Ensure ObjectId is instantiated correctly
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    console.log("Updated service response:", service);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el servicio', error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el servicio', error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
  }
};

export const assignTechnicianToService = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // Validate and convert technicianId to ObjectId
    const technicianObjectId = new mongoose.Types.ObjectId(technicianId);

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { technician: technicianObjectId },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error al asignar técnico al servicio', error: error.message });
  }
};
