import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    lowercase: true
  },  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  document: {
    type: String,
    required: [true, 'El documento de identidad es requerido'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true
  },serviceType: {
    type: String,
    required: [true, 'El tipo de servicio es requerido'],
    enum: ['pest-control', 'gardening', 'residential-fumigation', 'commercial-fumigation', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  preferredDate: {
    type: Date,
    required: [true, 'La fecha preferida es requerida']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;