// Inventory item model
import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide an item name"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please enter quantity"],
      min: [0, "Quantity cannot be negative"],
    },
    unitOfMeasure: {
      type: String,
      required: [true, "Please provide unit of measure"],
      enum: ["unidad", "ml", "gr"],
      default: "unidad",
    },
    description: {
      type: String,
    },
    lastRestockDate: {
      type: Date,
      default: Date.now,
    },
    minimumStock: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

export default InventoryItem;
