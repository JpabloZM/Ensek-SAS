import React from "react";
import ServicioCard from "./ServicioCard";
import { useAlertas } from "../../hooks/useAlertas";

const Sidebar = ({
  serviciosPendientes,
  onAgregarServicio,
  onEliminarServicio,
  onAsignarServicio,
}) => {
  const { mostrarAlerta } = useAlertas();

  const handleAgregarServicio = async () => {
    const { value: formValues } = await mostrarAlerta({
      title: "Nuevo Servicio",
      html: `
        <form id="servicioForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Nombre del servicio</label>
            <input type="text" id="nombre" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Descripción</label>
            <textarea id="descripcion" class="form-control" rows="3" required style="border-color: #c5f198;"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Duración (minutos)</label>
            <input type="number" id="duracion" class="form-control" min="15" step="15" value="60" required style="border-color: #c5f198;">
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      background: "#ffffff",
      color: "#004122",
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const duracion = document.getElementById("duracion").value;

        if (!nombre || !descripcion || !duracion) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor complete todos los campos",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }

        return {
          nombre,
          descripcion,
          duracion: parseInt(duracion),
        };
      },
    });

    if (formValues) {
      onAgregarServicio({
        id: Date.now(),
        ...formValues,
        color: "#87c947",
      });
      mostrarAlerta({
        icon: "success",
        title: "Servicio Agregado",
        text: "El servicio ha sido agregado correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };

  return (
    <div className="col-md-3 sidebar">
      <div className="p-4">
        <h4 className="mb-4">Servicios Pendientes</h4>
        <button
          onClick={handleAgregarServicio}
          className="btn btn-primary mb-4 w-100"
        >
          <i className="fas fa-plus me-2"></i>Agregar Servicio
        </button>
        <div className="servicios-container">
          {serviciosPendientes.map((servicio) => (
            <ServicioCard
              key={servicio.id}
              servicio={servicio}
              onEliminar={() => onEliminarServicio(servicio.id)}
              onAsignarServicio={onAsignarServicio}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
