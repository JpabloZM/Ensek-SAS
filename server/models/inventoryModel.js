// Inventory item model
import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['equipment', 'chemical', 'tool', 'uniform', 'other'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please enter quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitOfMeasure: {
      type: String,
      required: [true, 'Please provide unit of measure'],
      enum: ['units', 'liters', 'kilograms', 'packages', 'other'],
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
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
