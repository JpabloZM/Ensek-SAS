import { useState } from "react";
import Swal from "sweetalert2";
import "./Inventory.css";

const Inventory = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      nombre: "Aspersora",
      cantidad: 7,
      unidad: "unidad",
      minimo: 7,
      estado: "Disponible",
      ubicacion: "Bodega 2",
    },
    {
      id: 2,
      nombre: "Borax",
      cantidad: 500,
      unidad: "ml",
      minimo: 1000,
      estado: "Bajo Stock",
      ubicacion: "Bodega 1",
    },
    {
      id: 3,
      nombre: "Cebos",
      cantidad: 500,
      unidad: "gr",
      minimo: 250,
      estado: "Disponible",
      ubicacion: "Bodega 1",
    },
    {
      id: 4,
      nombre: "Fertilizante NPK",
      cantidad: 0,
      unidad: "gr",
      minimo: 1000,
      estado: "Agotado",
      ubicacion: "Bodega 2",
    },
  ]);

  // Estados para el buscador y filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    minimo: "",
    ubicacion: "",
  });

  // Estado para mensajes de error y éxito
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // Nuevo estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Función para mostrar mensajes
  const mostrarMensaje = async (tipo, texto) => {
    await Swal.fire({
      title: tipo === "exito" ? "¡Éxito!" : "Error",
      text: texto,
      icon: tipo === "exito" ? "success" : "error",
      confirmButtonColor: "#87c947",
      confirmButtonText: "Aceptar",
    });
  };

  // Función para validar el formulario
  const validarFormulario = async () => {
    if (parseInt(formData.cantidad) <= 0) {
      await Swal.fire({
        title: "Error de validación",
        text: "La cantidad debe ser un número positivo",
        icon: "error",
        confirmButtonColor: "#87c947",
        confirmButtonText: "Entendido",
      });
      return false;
    }

    if (parseInt(formData.minimo) <= 0) {
      await Swal.fire({
        title: "Error de validación",
        text: "El stock mínimo debe ser un número positivo",
        icon: "error",
        confirmButtonColor: "#87c947",
        confirmButtonText: "Entendido",
      });
      return false;
    }

    if (!formData.nombre || !formData.ubicacion || !formData.unidad) {
      await Swal.fire({
        title: "Error de validación",
        text: "Todos los campos son obligatorios",
        icon: "error",
        confirmButtonColor: "#87c947",
        confirmButtonText: "Entendido",
      });
      return false;
    }

    return true;
  };

  // Función para calcular el estado basado en la cantidad y mínimo
  const calcularEstado = (cantidad, minimo) => {
    if (cantidad === 0) return "Agotado";
    if (cantidad <= minimo) return "Bajo Stock";
    return "Disponible";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validarFormulario()) return;

    // Cerrar el modal antes de mostrar la confirmación
    setShowForm(false);

    // Confirmar antes de agregar
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
      // Si cancela, volver a mostrar el formulario
      setShowForm(true);
      return;
    }

    try {
      const cantidad = parseInt(formData.cantidad);
      const minimo = parseInt(formData.minimo);

      // Crear nuevo item
      const newItem = {
        id: items.length + 1,
        nombre: formData.nombre,
        cantidad: cantidad,
        unidad: formData.unidad,
        minimo: minimo,
        estado: calcularEstado(cantidad, minimo),
        ubicacion: formData.ubicacion,
      };

      // Actualizar la lista de items
      setItems([...items, newItem]);

      // Mostrar mensaje de éxito
      mostrarMensaje("exito", "Item agregado correctamente");

      // Limpiar el formulario
      setFormData({
        nombre: "",
        cantidad: "",
        unidad: "",
        minimo: "",
        ubicacion: "",
      });
    } catch (error) {
      mostrarMensaje("error", "Error al agregar el item. Intente nuevamente.");
      // Si hay error, volver a mostrar el formulario
      setShowForm(true);
    }
  };

  // Función para eliminar items
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
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);
      mostrarMensaje("exito", "Item eliminado correctamente");
    } catch (error) {
      mostrarMensaje("error", "Error al eliminar el item. Intente nuevamente.");
    }
  };

  // Función para iniciar la edición
  const handleEdit = (item) => {
    setEditMode(true);
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      cantidad: item.cantidad,
      unidad: item.unidad,
      minimo: item.minimo,
      ubicacion: item.ubicacion,
    });
    setShowForm(true);
  };

  // Función para actualizar un item
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    // Cerrar el modal antes de mostrar la confirmación
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
      // Si cancela, volver a mostrar el formulario
      setShowForm(true);
      return;
    }

    try {
      const cantidad = parseInt(formData.cantidad);
      const minimo = parseInt(formData.minimo);

      // Crear item actualizado
      const updatedItem = {
        ...editingItem,
        nombre: formData.nombre,
        cantidad: cantidad,
        unidad: formData.unidad,
        minimo: minimo,
        estado: calcularEstado(cantidad, minimo),
        ubicacion: formData.ubicacion,
      };

      // Actualizar la lista de items
      const newItems = items.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      );
      setItems(newItems);

      // Mostrar mensaje de éxito
      mostrarMensaje("exito", "Item actualizado correctamente");

      // Limpiar estados
      setFormData({
        nombre: "",
        cantidad: "",
        unidad: "",
        minimo: "",
        ubicacion: "",
      });
      setEditMode(false);
      setEditingItem(null);
    } catch (error) {
      mostrarMensaje(
        "error",
        "Error al actualizar el item. Intente nuevamente."
      );
      // Si hay error, volver a mostrar el formulario
      setShowForm(true);
    }
  };

  // Función para filtrar items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterState === "" ||
      item.estado.toLowerCase().includes(filterState.toLowerCase());
    return matchesSearch && matchesFilter;
  });

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
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unidad">Unidad de Medida</label>
                  <select
                    id="unidad"
                    name="unidad"
                    value={formData.unidad}
                    onChange={(e) =>
                      setFormData({ ...formData, unidad: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minimo">Stock Mínimo</label>
                  <input
                    type="number"
                    id="minimo"
                    name="minimo"
                    min="1"
                    value={formData.minimo}
                    onChange={(e) =>
                      setFormData({ ...formData, minimo: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación</label>
                  <select
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) =>
                      setFormData({ ...formData, ubicacion: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccionar ubicación</option>
                    <option value="Bodega 1">Bodega 1</option>
                    <option value="Bodega 2">Bodega 2</option>
                  </select>
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
                      nombre: "",
                      cantidad: "",
                      unidad: "",
                      minimo: "",
                      ubicacion: "",
                    });
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  onClick={editMode ? handleUpdate : handleSubmit}
                >
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
            <option value="disponible">Disponible</option>
            <option value="bajo stock">Bajo Stock</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td title={item.nombre}>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.unidad}</td>
                    <td>{item.minimo}</td>
                    <td>
                      <span
                        className={`estado-${item.estado
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td>{item.ubicacion}</td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => handleDelete(item.id)}
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
