import React, { useState, useEffect } from "react";
import { useInventory } from "../../../hooks/useInventory";
import { useAlertas } from "../../hooks/useAlertas";
import Swal from "sweetalert2";
import { withDarkMode } from "../../utils/sweetalert-config";
import "./Inventory.css";
import "./dark-mode-inventory.css";

const calculateStatus = (quantity, minimumStock) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity < minimumStock) return "low_stock";
  return "available";
};

const Inventory = ({ darkMode = false }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [showForm, setShowForm] = useState(false);
  const initialFormData = {
    name: "",
    quantity: "",
    unit: "un", // Set default unit to "un" (unidades)
    unit_price: "",
    minimum_stock: "",
    status: "available",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Define valid units for the dropdown
  const validUnits = [
    { value: "un", label: "Unidades" },
    { value: "ml", label: "Mililitros" },
    { value: "gr", label: "Gramos" },
    { value: "kg", label: "Kilogramos" },
    { value: "lt", label: "Litros" },
  ];
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mostrarMensaje } = useAlertas();
  const { getAllItems, addItem, updateItem, deleteItem } = useInventory();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getAllItems();
      setItems(data);
      setLoading(false);
    } catch (error) {
      mostrarMensaje("error", "Error al cargar el inventario");
      setLoading(false);
    }
  };

  const validarFormulario = async () => {
    if (parseInt(formData.quantity) < 0) {
      await mostrarMensaje("error", "La cantidad debe ser un número positivo");
      return false;
    }

    if (parseInt(formData.minimum_stock) < 0) {
      await mostrarMensaje(
        "error",
        "El stock mínimo debe ser un número positivo"
      );
      return false;
    }

    if (!formData.name || formData.unit_price === "") {
      await mostrarMensaje("error", "Todos los campos son obligatorios");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validarFormulario())) return;

    try {
      const result = await Swal.fire(
        withDarkMode({
          title: "¿Agregar nuevo item?",
          text: "¿Estás seguro de agregar este item al inventario?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#87c947",
          cancelButtonColor: darkMode ? "#444" : "#d33",
          confirmButtonText: "Sí, agregar",
          cancelButtonText: "Cancelar",
        })
      );

      if (result.isConfirmed) {
        // Preparar datos para enviar
        if (!formData.name?.trim()) {
          throw new Error("El nombre es requerido");
        }
        if (!formData.unit) {
          throw new Error("La unidad es requerida");
        }

        // Convert and validate numeric fields
        const quantity = parseInt(formData.quantity);
        const unit_price = parseFloat(formData.unit_price);
        const minimum_stock = parseInt(formData.minimum_stock);

        if (isNaN(quantity) || quantity < 0) {
          throw new Error(
            "La cantidad debe ser un número válido y no negativo"
          );
        }
        if (isNaN(unit_price) || unit_price < 0) {
          throw new Error(
            "El precio unitario debe ser un número válido y no negativo"
          );
        }
        if (isNaN(minimum_stock) || minimum_stock < 0) {
          throw new Error(
            "El stock mínimo debe ser un número válido y no negativo"
          );
        }

        const itemToCreate = {
          ...formData,
          quantity,
          unit_price,
          minimum_stock,
        };

        // Crear nuevo item en la base de datos
        await addItem(itemToCreate);

        // Recargar la lista de items
        await loadInventory();

        // Mostrar mensaje de éxito
        await mostrarMensaje(
          "exito",
          "Item agregado correctamente al inventario"
        );

        // Cerrar el formulario y limpiar los campos
        setShowForm(false);
        setFormData({
          name: "",
          quantity: "",
          unit: "un",
          unit_price: "",
          minimum_stock: "",
          status: "available",
        });
      }
    } catch (error) {
      console.error("Error al agregar item:", error);
      await mostrarMensaje("error", "Error al agregar el item al inventario");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire(
      withDarkMode({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#87c947",
        cancelButtonColor: darkMode ? "#444" : "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })
    );

    if (result.isConfirmed) {
      try {
        // Eliminar el item de la base de datos
        await deleteItem(id); // MongoDB usa el _id tal cual viene de la base de datos

        // Recargar la lista
        await loadInventory();

        await mostrarMensaje("exito", "Item eliminado correctamente");
      } catch (error) {
        await mostrarMensaje("error", "Error al eliminar el item");
      }
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      unit_price: item.unit_price.toString(),
      minimum_stock: item.minimum_stock.toString(),
      description: item.description,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!(await validarFormulario())) return;

    try {
      // Actualizar el item en la base de datos
      await updateItem(editingItem._id, formData);

      // Recargar la lista
      await loadInventory();

      // Mostrar mensaje de éxito
      await mostrarMensaje("exito", "Item actualizado correctamente"); // Cerrar el formulario y limpiar los campos
      resetForm();
    } catch (error) {
      await mostrarMensaje("error", "Error al actualizar el item");
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "estado-disponible";

    switch (status.toLowerCase()) {
      case "available":
        return "estado-disponible";
      case "low_stock":
        return "estado-bajo-stock";
      case "out_of_stock":
        return "estado-agotado";
      default:
        return "estado-disponible";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Disponible";

    switch (status.toLowerCase()) {
      case "available":
        return "Disponible";
      case "low_stock":
        return "Bajo Stock";
      case "out_of_stock":
        return "Agotado";
      default:
        return "Disponible";
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterState === "" ||
      item.status.toLowerCase() === filterState.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditMode(false);
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading)
    return (
      <div className={`loading ${darkMode ? "dark-theme" : ""}`}>
        Cargando...
      </div>
    );

  return (
    <div className={`inventory ${darkMode ? "dark-theme" : ""}`}>
      <div className="inventory-header">
        <h1>Inventario</h1>
        <button className="add-button" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i>
          Agregar Item
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editMode ? "Editar Item" : "Agregar Nuevo Item"}</h2>
            <form onSubmit={editMode ? handleUpdate : handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre del Producto</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Cantidad</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value.replace(/^0+/, ""),
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit">Unidad de Medida</label>
                  <select
                    id="unit"
                    name="unit"
                    className={`unit-select ${darkMode ? "dark-select" : ""}`}
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  >
                    {validUnits.map((unit) => (
                      <option
                        key={unit.value}
                        value={unit.value}
                        className={darkMode ? "dark-option" : ""}
                      >
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit_price">Precio Unitario</label>
                  <input
                    id="unit_price"
                    name="unit_price"
                    type="number"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: e.target.value.replace(/^0+/, ""),
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="minimum_stock">Stock Mínimo</label>
                  <input
                    id="minimum_stock"
                    name="minimum_stock"
                    type="number"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimum_stock: e.target.value.replace(/^0+/, ""),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setEditingItem(null);
                    setFormData({
                      name: "",
                      quantity: "",
                      unit: "un",
                      unit_price: "",
                      minimum_stock: "",
                      status: "available",
                    });
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  {editMode ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="inventory-content">
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar item..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={`filter-select ${darkMode ? "dark-select" : ""}`}
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="" className={darkMode ? "dark-option" : ""}>
              Todos los estados
            </option>
            <option value="available" className={darkMode ? "dark-option" : ""}>
              Disponible
            </option>
            <option value="low_stock" className={darkMode ? "dark-option" : ""}>
              Bajo Stock
            </option>
            <option
              value="out_of_stock"
              className={darkMode ? "dark-option" : ""}
            >
              Agotado
            </option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Precio Unitario</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td title={item.name}>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>
                      ${new Intl.NumberFormat("es-CO").format(item.unit_price)}
                    </td>
                    <td>{item.minimum_stock}</td>
                    <td>
                      <span className={getStatusClass(item.status)}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => handleDelete(item._id)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No se encontraron items que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
