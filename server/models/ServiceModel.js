import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "El teléfono es requerido"],
      trim: true,
    },
    document: {
      type: String,
      required: [true, "El documento es requerido"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "La dirección es requerida"],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, "El tipo de servicio es requerido"],
      enum: ["pest-control", "gardening", "residential-fumigation", "commercial-fumigation", "other"]
    },
    description: {
      type: String,
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: [true, "La fecha preferida es requerida"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure dates are properly converted
serviceSchema.pre('save', function(next) {
  if (this.preferredDate && !(this.preferredDate instanceof Date)) {
    this.preferredDate = new Date(this.preferredDate);
  }
  next();
});

// Add any static methods here if needed
serviceSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Create the model
const ServiceModel = mongoose.model("Service", serviceSchema);

// Log model initialization
console.log("ServiceModel initialized:", {
  modelName: ServiceModel.modelName,
  collection: ServiceModel.collection.name,
  hasSchema: !!ServiceModel.schema
});

export default ServiceModel;
