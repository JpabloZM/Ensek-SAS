import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    document: String,
    address: String,
    serviceType: String,
    description: String,
    preferredDate: Date,
    status: {
      type: String,
      default: "pending",
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const ServiceModel = mongoose.model("Service", serviceSchema);

// Add some debug logs when the model is initialized
ServiceModel.watch().on("change", (data) => {
  console.log("Service collection changed:", data);
});

console.log("ServiceModel initialized with methods:", {
  modelName: ServiceModel.modelName,
  collection: ServiceModel.collection.name,
  hasSchema: !!ServiceModel.schema,
  methods: Object.keys(ServiceModel.prototype),
  statics: Object.keys(ServiceModel.statics),
});

export default ServiceModel;
