// Service request model
import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow anonymous requests
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please provide your address'],
    },
    serviceType: {
      type: String,
      enum: ['pest-control', 'gardening', 'fumigation', 'other'],
      required: [true, 'Please select a service type'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the service needed'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Please provide a preferred date'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;
