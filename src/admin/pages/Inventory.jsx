import { useState } from "react";
import "./Inventory.css";

const Inventory = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      nombre: "Herramienta A",
      cantidad: 15,
      minimo: 5,
      estado: "Disponible",
      ubicacion: "Almacén Principal",
    },
    {
      id: 2,
      nombre: "Repuesto B",
      cantidad: 3,
      minimo: 10,
      estado: "Bajo Stock",
      ubicacion: "Almacén Principal",
    },
    {
      id: 3,
      nombre: "Material C",
      cantidad: 50,
      minimo: 20,
      estado: "Disponible",
      ubicacion: "Bodega 2",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    minimo: "",
    ubicacion: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para agregar el item
    setShowForm(false);
  };

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
            <h2>Agregar Nuevo Item</h2>
            <form onSubmit={handleSubmit}>
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
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minimo">Stock Mínimo</label>
                  <input
                    type="number"
                    id="minimo"
                    name="minimo"
                    value={formData.minimo}
                    onChange={(e) =>
                      setFormData({ ...formData, minimo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ubicacion">Ubicación</label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) =>
                    setFormData({ ...formData, ubicacion: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar
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
          />
          <select className="filter-select">
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="bajo">Bajo Stock</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
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
                    <button className="btn-editar">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-eliminar">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
