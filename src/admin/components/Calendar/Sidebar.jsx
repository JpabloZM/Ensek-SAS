import React from "react";
import ServicioCard from "./ServicioCard";
import { useAlertas } from "../../hooks/useAlertas";

const Sidebar = ({
  serviciosPendientes,
  onAgregarServicio,
  onEliminarServicio,
  onAsignarServicio,
  onEditarServicio,
}) => {
  const { mostrarAlerta } = useAlertas();
  const handleAgregarServicio = async () => {
    const { value: formValues } = await mostrarAlerta({
      title: "Nuevo Servicio",
      html: `
        <form id="servicioForm">
          <div class="input-group">
            <label>Tipo de servicio</label>
            <select id="nombre" class="form-field" required>
              <option value="">Seleccionar tipo de servicio...</option>
              <option value="pest-control">Control de Plagas</option>
              <option value="gardening">Jardinería</option>
              <option value="residential-fumigation">Fumigación Residencial</option>
              <option value="commercial-fumigation">Fumigación Comercial</option>
            </select>
          </div>
          <div class="input-group">
            <label>Cliente</label>
            <input type="text" id="clientName" class="form-field" placeholder="Nombre del cliente" required>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="clientEmail" class="form-field" placeholder="correo@ejemplo.com" required>
          </div>
          <div class="input-group">
            <label>Teléfono</label>
            <input type="tel" id="clientPhone" class="form-field" placeholder="Teléfono de contacto" required>
          </div>
          <div class="input-group">
            <label>Dirección</label>
            <input type="text" id="address" class="form-field" placeholder="Dirección del servicio" required>
          </div>
          <div class="input-group">
            <label>Descripción</label>
            <textarea id="descripcion" class="form-field" placeholder="Descripción detallada del servicio" rows="2" required></textarea>
          </div>
        </form>
        <style>
          #servicioForm {
            display: grid;
            gap: 10px;
            padding: 15px;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .input-group label {
            color: #87c947;
            font-weight: 500;
          }
          .form-field {
            padding: 8px;
            border: 1px solid #87c947;
            border-radius: 4px;
            background: white;
            width: 100%;
            box-sizing: border-box;            
            min-width: 370px;
            max-width: 370px;
          }
          .swal2-popup {
            width: 500px !important;
          }
          .swal2-title {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
        </style>
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
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const address = document.getElementById("address").value;
        const descripcion = document.getElementById("descripcion").value;

        if (
          !nombre ||
          !clientName ||
          !clientEmail ||
          !clientPhone ||
          !address ||
          !descripcion
        ) {
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
        const serviceTypes = {
          "pest-control": "Control de Plagas",
          gardening: "Jardinería",
          "residential-fumigation": "Fumigación Residencial",
          "commercial-fumigation": "Fumigación Comercial",
        };

        // Preparar datos del formulario asegurando que serviceType tenga el valor correcto para el backend
        return {
          nombre: serviceTypes[nombre] || nombre, // Nombre en español para mostrar
          serviceType: nombre, // Valor original para el backend (pest-control, gardening, etc.)
          clientName,
          clientEmail,
          clientPhone,
          address,
          descripcion,
          // Agregar el documento como campo obligatorio para el backend
          document: "1234567890", // Valor por defecto ya que no se solicita en el formulario
        };
      },
    });
    if (formValues) {
      const currentDate = new Date().toISOString();
      // Asegurarse de que todos los campos estén presentes y con los tipos correctos
      const servicioNuevo = {
        ...formValues,
        status: "pending",
        preferredDate: currentDate,
        // Asegurar que estos campos siempre estén presentes
        nombre: formValues.nombre,
        serviceType: formValues.serviceType, // Mantener serviceType original para enviar al backend
        // Documento es un campo obligatorio en el backend
        document: "1234567890", // Valor por defecto ya que no se pide en el formulario
        estado: "pendiente",
      };

      console.log("Enviando nuevo servicio:", servicioNuevo);

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
        <h4>Servicios Pendientes</h4>
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
              onEditar={onEditarServicio}
              // Forzar que el componente se renderice con clase correcta
              className="servicio-card"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
