// Service request model
import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous requests
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    address: {
      type: String,
      required: [true, "Please provide your address"],
    },
    serviceType: {
      type: String,
      required: [true, "Please select a service type"],
      // Remover enum para permitir tipos de servicio personalizados
      validate: {
        validator: function (value) {
          // Permitir cualquier string no vacío para máxima flexibilidad
          return typeof value === "string" && value.trim().length > 0;
        },
        message: "Service type must be a non-empty string",
      },
    },
    description: {
      type: String,
      required: false, // Hacemos el campo opcional para evitar errores de validación
    },
    preferredDate: {
      type: Date,
      required: [true, "Please provide a preferred date"],
    },
    scheduledStart: {
      type: Date,
      required: false,
    },
    scheduledEnd: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    technicians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    document: {
      type: String,
      required: false,
    },
    clientName: {
      type: String,
      required: false,
    },
    clientEmail: {
      type: String,
      required: false,
    },
    clientPhone: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Especificar explícitamente el nombre de la colección como "servicesrequests"
const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema,
  "servicesrequests"
);

// Verificación para confirmar el nombre de la colección en el arranque
console.log("ServiceRequest collection name:", ServiceRequest.collection.name);

export default ServiceRequest;
