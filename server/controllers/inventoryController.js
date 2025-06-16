// Inventory controller
import InventoryItem from "../models/InventoryItem.js";

// Calculate item status based on quantity and minimum stock
const calculateStatus = (quantity, minimum_stock) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity < minimum_stock) return "low_stock";
  return "available";
};

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    // Validar campos requeridos
    const requiredFields = [
      "name",
      "quantity",
      "unit",
      "unit_price",
      "minimum_stock",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("Campos faltantes:", missingFields);
      return res.status(400).json({
        message: "Faltan campos requeridos",
        missingFields,
      });
    }

    // Validar que la unidad sea válida
    const validUnits = ["un", "ml", "gr", "kg", "lt"];
    if (!validUnits.includes(req.body.unit)) {
      console.log("Unidad inválida:", req.body.unit);
      return res.status(400).json({
        message: "Unidad inválida",
        validUnits,
      });
    }

    const itemData = {
      ...req.body,
      status: calculateStatus(req.body.quantity, req.body.minimum_stock),
    };

    console.log("Intentando crear item con datos:", itemData);
    const item = new InventoryItem(itemData);
    await item.save();
    console.log("Item creado exitosamente:", item);
    res.status(201).json(item);
  } catch (error) {
    console.error("Error al crear item:", error);
    res
      .status(400)
      .json({ message: "Error al crear el item", error: error.message });
  }
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });

    // Update status for each item
    const updatedItems = items.map((item) => {
      const status = calculateStatus(item.quantity, item.minimum_stock);
      if (item.status !== status) {
        // Update item status in database if it has changed
        InventoryItem.findByIdAndUpdate(item._id, { status }).exec();
      }
      return { ...item.toObject(), status };
    });

    res.json(updatedItems);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los items del inventario",
      error: error.message,
    });
  }
};

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private/Admin
export const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }
    res.json(item);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el item", error: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      status: calculateStatus(req.body.quantity, req.body.minimumStock),
    };

    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }
    res.json(item);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar el item", error: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }
    res.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el item", error: error.message });
  }
};
