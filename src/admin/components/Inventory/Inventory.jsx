import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { inventoryService } from "../../../admin/services/api";
import "./Inventory.css";

// Datos de ejemplo para el inventario
const datosEjemplo = [
  {
    id: 1,
    name: "Insecticida Multiusos Premium",
    quantity: 50,
    unit: "ml",
    unit_price: 45000,
    minimum_stock: 15,
    description:
      "Insecticida de amplio espectro para control de plagas domésticas y jardín",
    status: "available",
  },
  {
    id: 2,
    name: "Gel Cucarachicida Profesional",
    quantity: 5,
    unit: "gr",
    unit_price: 120000,
    minimum_stock: 8,
    description: "Gel especial para el control de cucarachas en áreas críticas",
    status: "low_stock",
  },
  {
    id: 3,
    name: "Trampa UV para Insectos",
    quantity: 0,
    unit: "un",
    unit_price: 280000,
    minimum_stock: 5,
    description:
      "Trampa de luz UV para control de insectos voladores, uso comercial",
    status: "out_of_stock",
  },
  {
    id: 4,
    name: "Rodenticida en Bloque",
    quantity: 75,
    unit: "gr",
    unit_price: 35000,
    minimum_stock: 20,
    description: "Cebo en bloque para control de roedores, uso profesional",
    status: "available",
  },
  {
    id: 5,
    name: "Nebulizador ULV Portátil",
    quantity: 8,
    unit: "un",
    unit_price: 1200000,
    minimum_stock: 3,
    description: "Equipo nebulizador ULV para aplicación de insecticidas",
    status: "available",
  },
  {
    id: 6,
    name: "Insecticida Concentrado",
    quantity: 25,
    unit: "ml",
    unit_price: 85000,
    minimum_stock: 10,
    description: "Insecticida concentrado para dilución, uso profesional",
    status: "available",
  },
  {
    id: 7,
    name: "Estación Cebo Roedores",
    quantity: 120,
    unit: "un",
    unit_price: 15000,
    minimum_stock: 30,
    description: "Estación de cebo segura para control de roedores",
    status: "available",
  },
  {
    id: 8,
    name: "Larvicida Biológico",
    quantity: 4,
    unit: "gr",
    unit_price: 95000,
    minimum_stock: 6,
    description: "Control biológico de larvas de mosquitos y otros insectos",
    status: "low_stock",
  },
];

const Inventory = () => {
  const [items, setItems] = useState(datosEjemplo);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "un",
    unit_price: "",
    minimum_stock: "",
    description: "",
    status: "available",
  });
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      // Simulamos una carga de datos
      setTimeout(() => {
        setItems(datosEjemplo);
        setLoading(false);
      }, 1000);
    } catch (error) {
      mostrarMensaje("error", "Error al cargar el inventario");
      setLoading(false);
    }
  };

  const mostrarMensaje = async (tipo, texto) => {
    await Swal.fire({
      title: tipo === "exito" ? "¡Éxito!" : "Error",
      text: texto,
      icon: tipo === "exito" ? "success" : "error",
      confirmButtonColor: "#87c947",
      confirmButtonText: "Aceptar",
    });
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

    if (!formData.name || !formData.description || formData.unit_price === "") {
      await mostrarMensaje("error", "Todos los campos son obligatorios");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validarFormulario())) return;

    setShowForm(false);

    const result = await Swal.fire({
      title: "¿Agregar nuevo item?",
      text: "¿Estás seguro de agregar este item al inventario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, agregar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      setShowForm(true);
      return;
    }

    try {
      // Simulamos la creación de un nuevo item
      const newItem = {
        ...formData,
        id: items.length + 1,
        status:
          parseInt(formData.quantity) === 0
            ? "out_of_stock"
            : parseInt(formData.quantity) <= parseInt(formData.minimum_stock)
            ? "low_stock"
            : "available",
      };
      setItems([...items, newItem]);
      mostrarMensaje("exito", "Item agregado correctamente");
      setFormData({
        name: "",
        quantity: "",
        unit: "un",
        unit_price: "",
        minimum_stock: "",
        description: "",
        status: "available",
      });
    } catch (error) {
      mostrarMensaje("error", "Error al agregar el item");
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar item?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      // Simulamos la eliminación
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);
      mostrarMensaje("exito", "Item eliminado correctamente");
    } catch (error) {
      mostrarMensaje("error", "Error al eliminar el item");
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      minimum_stock: item.minimum_stock,
      description: item.description,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!(await validarFormulario())) return;

    setShowForm(false);

    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "¿Estás seguro de actualizar este item?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      setShowForm(true);
      return;
    }

    try {
      // Simulamos la actualización
      const updatedItem = {
        ...formData,
        id: editingItem.id,
        status:
          parseInt(formData.quantity) === 0
            ? "out_of_stock"
            : parseInt(formData.quantity) <= parseInt(formData.minimum_stock)
            ? "low_stock"
            : "available",
      };
      const newItems = items.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      );
      setItems(newItems);
      mostrarMensaje("exito", "Item actualizado correctamente");
      setFormData({
        name: "",
        quantity: "",
        unit: "un",
        unit_price: "",
        minimum_stock: "",
        description: "",
        status: "available",
      });
      setEditMode(false);
      setEditingItem(null);
    } catch (error) {
      mostrarMensaje("error", "Error al actualizar el item");
      setShowForm(true);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return "estado-disponible";
      case "low_stock":
        return "estado-bajo-stock";
      case "out_of_stock":
        return "estado-agotado";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "low_stock":
        return "Bajo Stock";
      case "out_of_stock":
        return "Agotado";
      default:
        return status;
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

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="inventory">
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
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
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
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unidad de medida</label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  >
                    <option value="un">Unidades (un)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="gr">Gramos (gr)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit_price">Precio Unitario</label>
                  <input
                    type="number"
                    id="unit_price"
                    name="unit_price"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minimum_stock">Stock Mínimo</label>
                  <input
                    type="number"
                    id="minimum_stock"
                    name="minimum_stock"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimum_stock: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
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
                      unit_price: "",
                      minimum_stock: "",
                      description: "",
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
            className="filter-select"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="low_stock">Bajo Stock</option>
            <option value="out_of_stock">Agotado</option>
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
                  <tr key={item.id}>
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
                        onClick={() => handleDelete(item.id)}
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
