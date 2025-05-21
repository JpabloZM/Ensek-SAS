// Inventory controller
import InventoryItem from '../models/inventoryModel.js';

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unitOfMeasure,
      description,
      minimumStock,
      price,
    } = req.body;

    const inventoryItem = await InventoryItem.create({
      name,
      category,
      quantity,
      unitOfMeasure,
      description,
      minimumStock,
      price,
      lastRestockDate: new Date(),
    });

    if (inventoryItem) {
      res.status(201).json({
        success: true,
        inventoryItem,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid inventory data',
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

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({}).sort({ name: 1 });

    res.json({
      success: true,
      count: inventoryItems.length,
      inventoryItems,
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

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private/Admin
export const getInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      inventoryItem,
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

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Update fields
    const {
      name,
      category,
      quantity,
      unitOfMeasure,
      description,
      minimumStock,
      price,
    } = req.body;

    inventoryItem.name = name || inventoryItem.name;
    inventoryItem.category = category || inventoryItem.category;
    inventoryItem.quantity = quantity !== undefined ? quantity : inventoryItem.quantity;
    inventoryItem.unitOfMeasure = unitOfMeasure || inventoryItem.unitOfMeasure;
    inventoryItem.description = description || inventoryItem.description;
    inventoryItem.minimumStock = minimumStock !== undefined ? minimumStock : inventoryItem.minimumStock;
    inventoryItem.price = price !== undefined ? price : inventoryItem.price;

    // If quantity increased, update lastRestockDate
    if (quantity > inventoryItem.quantity) {
      inventoryItem.lastRestockDate = new Date();
    }

    const updatedInventoryItem = await inventoryItem.save();

    res.json({
      success: true,
      inventoryItem: updatedInventoryItem,
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

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    await inventoryItem.deleteOne();

    res.json({
      success: true,
      message: 'Inventory item removed',
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
