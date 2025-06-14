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
        <form id="servicioForm" class="text-left">          <div class="mb-3">
            <label class="form-label">Tipo de servicio</label>
            <select id="nombre" class="form-control" required style="border-color: #c5f198;">
              <option value="">Seleccionar tipo de servicio...</option>
              <option value="pest-control">Control de Plagas</option>
              <option value="gardening">Jardinería</option>
              <option value="residential-fumigation">Fumigación Residencial</option>
              <option value="commercial-fumigation">Fumigación Comercial</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Cliente</label>
            <input type="text" id="clientName" placeholder="Nombre del cliente" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" id="clientEmail" placeholder="correo@ejemplo.com" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <input type="tel" id="clientPhone" placeholder="Teléfono de contacto" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label">Dirección</label>
            <input type="text" id="address" placeholder="Dirección del servicio" class="form-control" required style="border-color: #c5f198;">
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea id="descripcion" placeholder="Descripción detallada del servicio" class="form-control" rows="3" required style="border-color: #c5f198;"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Duración (minutos)</label>
            <input type="number" id="duracion" placeholder="Duración en minutos" class="form-control" min="15" step="15" required style="border-color: #c5f198;">
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
      preConfirm: () => {        const nombre = document.getElementById("nombre").value;
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const address = document.getElementById("address").value;
        const descripcion = document.getElementById("descripcion").value;
        const duracion = document.getElementById("duracion").value;

        if (!nombre || !clientName || !clientEmail || !clientPhone || !address || !descripcion || !duracion) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor complete todos los campos",
            confirmButtonColor: "#87c947",
            background: "#f8ffec",
            color: "#004122",
          });
          return false;
        }        const serviceTypes = {
          'pest-control': 'Control de Plagas',
          'gardening': 'Jardinería',
          'residential-fumigation': 'Fumigación Residencial',
          'commercial-fumigation': 'Fumigación Comercial'
        };

        return {
          nombre: serviceTypes[nombre] || nombre,
          serviceType: nombre,
          clientName,
          clientEmail,
          clientPhone,
          address,
          descripcion,
          duracion: parseInt(duracion),
        };
      },
    });    if (formValues) {
      const servicioNuevo = {
        ...formValues,
        status: "pending",
        preferredDate: new Date().toISOString()
      };
      
      try {
        const savedService = await onAgregarServicio(servicioNuevo);
        mostrarAlerta({
          icon: "success",
          title: "Servicio Agregado",
          text: "El servicio ha sido agregado correctamente",
          timer: 1500,
          showConfirmButton: false,
          background: "#f8ffec",
          color: "#004122",
        });
      } catch (error) {
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "No se pudo agregar el servicio. Por favor, intente nuevamente.",
          confirmButtonColor: "#87c947",
          background: "#f8ffec",
          color: "#004122",
        });
      }
    }
  };

  return (
    <div className="col-md-3 sidebar">
      <div className="p-4">
        <h4>Solicitudes Pendientes</h4>
        <button onClick={handleAgregarServicio} className="btn btn-primary">
          <i className="fas fa-plus-circle me-2"></i>
          Agregar Servicio
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
