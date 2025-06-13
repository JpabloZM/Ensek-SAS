import React, { useState, useEffect } from "react";
import { useAlertas } from "../../hooks/useAlertas";
import "./AdminManagement.css";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const { mostrarAlerta } = useAlertas();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const adminsList = usuarios.filter((user) => user.role === "admin");
    setAdmins(adminsList);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Todos los campos son obligatorios",
      });
      return;
    }

    try {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      // Verificar si el email ya está registrado
      if (usuarios.some((user) => user.email === formData.email)) {
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "El email ya está registrado",
        });
        return;
      }

      // Crear nuevo administrador
      const nuevoAdmin = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      // Guardar en localStorage
      usuarios.push(nuevoAdmin);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      // Actualizar lista de admins
      loadAdmins();

      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        password: "",
      });

      mostrarAlerta({
        icon: "success",
        title: "Éxito",
        text: "Administrador agregado correctamente",
      });
    } catch (error) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Error al agregar administrador",
      });
    }
  };

  const handleDelete = async (adminId) => {
    const result = await mostrarAlerta({
      icon: "warning",
      title: "¿Eliminar administrador?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuariosActualizados = usuarios.filter(
          (user) => user.id !== adminId
        );
        localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));

        loadAdmins();

        mostrarAlerta({
          icon: "success",
          title: "Éxito",
          text: "Administrador eliminado correctamente",
        });
      } catch (error) {
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "Error al eliminar administrador",
        });
      }
    }
  };

  return (
    <div className="admin-management">
      <h2>Gestión de Administradores</h2>

      {/* Formulario para agregar administrador */}
      <div className="admin-form-container">
        <h3>Agregar Nuevo Administrador</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del administrador"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo del administrador"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña del administrador"
            />
          </div>

          <button type="submit" className="btn-primary">
            Agregar Administrador
          </button>
        </form>
      </div>

      {/* Lista de administradores */}
      <div className="admin-list">
        <h3>Administradores Registrados</h3>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.nombre}</td>
                  <td>{admin.email}</td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(admin.id)}
                    >
                      Eliminar
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

export default AdminManagement;
