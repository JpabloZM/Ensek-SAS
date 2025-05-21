// Service request controller
import ServiceRequest from '../models/serviceRequestModel.js';
import { isUsingMockDB } from '../config/db.js';
import { mockDb } from '../config/mockDb.js';

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
      preferredDate,    } = req.body;

    let serviceRequest;

    // Create service request
    if (isUsingMockDB()) {
      serviceRequest = await mockDb.createServiceRequest({
        user: req.user ? req.user._id : null,
        name,
        email,
        phone,
        address,
        serviceType,
        description,
        preferredDate: new Date(preferredDate),
      });
    } else {
      serviceRequest = await ServiceRequest.create({
        user: req.user ? req.user._id : null,
        name,
        email,
        phone,
        address,
        serviceType,
        description,
        preferredDate: new Date(preferredDate),
      });
    }

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
    let serviceRequests;
    
    if (isUsingMockDB()) {
      serviceRequests = await mockDb.getAllServiceRequests();
      // In MockDB we need to manually handle the user population
      serviceRequests = serviceRequests.map(request => {
        if (request.user) {
          const user = mockDb.findUserById(request.user);
          if (user) {
            request.user = {
              _id: user._id,
              name: user.name,
              email: user.email
            };
          }
        }
        return request;
      });
    } else {
      serviceRequests = await ServiceRequest.find({})
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate('user', 'name email');
    }

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
    let serviceRequest;
    
    if (isUsingMockDB()) {
      serviceRequest = await mockDb.getServiceRequestById(req.params.id);
      
      // Manually populate user data if needed
      if (serviceRequest && serviceRequest.user) {
        const user = await mockDb.findUserById(serviceRequest.user);
        if (user) {
          serviceRequest.user = {
            _id: user._id,
            name: user.name,
            email: user.email
          };
        }
      }
    } else {
      serviceRequest = await ServiceRequest.findById(req.params.id).populate(
        'user',
        'name email'
      );
    }

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
