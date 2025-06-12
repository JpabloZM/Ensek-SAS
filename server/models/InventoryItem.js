import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, "La cantidad es requerida"],
    min: [0, "La cantidad no puede ser negativa"],
  },
  unit: {
    type: String,
    required: [true, "La unidad es requerida"],
    enum: ["un", "ml", "gr", "kg", "lt"],
  },
  unit_price: {
    type: Number,
    required: [true, "El precio unitario es requerido"],
    min: [0, "El precio no puede ser negativo"],
  },
  minimum_stock: {
    type: Number,
    required: [true, "El stock mínimo es requerido"],
    min: [0, "El stock mínimo no puede ser negativo"],
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["available", "low_stock", "out_of_stock"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar updatedAt antes de cada actualización
inventoryItemSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("InventoryItem", inventoryItemSchema);
