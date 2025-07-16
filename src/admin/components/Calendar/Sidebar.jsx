import React from "react";
import ServicioCard from "./ServicioCard";
import { useAlertas } from "../../hooks/useAlertas";
import "./Sidebar.css";

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
        <div id="servicioForm">
          <div class="form-row">
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
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="clientEmail" class="form-field" placeholder="correo@ejemplo.com" required>
            </div>
            <div class="input-group">
              <label>Teléfono</label>
              <input type="tel" id="clientPhone" class="form-field" placeholder="Teléfono de contacto" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label>Municipio</label>
              <input type="text" id="municipality" class="form-field" placeholder="Municipio" required>
            </div>
            <div class="input-group">
              <label>Barrio</label>
              <input type="text" id="neighborhood" class="form-field" placeholder="Barrio o sector" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label>Dirección</label>
              <input type="text" id="streetAddress" class="form-field" placeholder="Calle/Carrera, número" required>
            </div>
            <div class="input-group">
              <label>Especificaciones</label>
              <input type="text" id="addressDetails" class="form-field" placeholder="Apto/Casa/Empresa/Referencias">
            </div>
          </div>
          
          <div class="form-row description-row">
            <div class="input-group full-width">
              <label>Descripción</label>
              <textarea id="descripcion" class="form-field" placeholder="Descripción detallada del servicio" rows="3" required></textarea>
            </div>
          </div>
        </div>
        <style>
          #servicioForm {
            padding: 15px 15px 5px 15px; /* Reducido el padding inferior */
            background-color: #2d3748;
            border-radius: 10px;
            width: 600px; /* Aumentado para dar más espacio */
            max-width: 600px;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center; /* Centrar contenido */
          }
          .form-row {
            display: flex;
            justify-content: center; /* Centrar elementos */
            margin-bottom: 20px;
            width: 100%;
            gap: 20px; /* Más espacio entre elementos */
            box-sizing: border-box;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            width: 270px; /* Ancho fijo exacto en píxeles - aumentado para coincidir con select */
            max-width: 270px; /* Limita el ancho máximo */
            min-width: 270px; /* Garantiza un ancho mínimo */
            box-sizing: border-box;
          }
          .input-group.full-width {
            width: 100%; /* Usar ancho completo disponible */
            max-width: 100%;
            min-width: 100%;
          }
          
          /* Estilos específicos para la fila de descripción */
          .description-row {
            padding: 0 10px; /* Añade un poco de padding horizontal */
            box-sizing: border-box;
            justify-content: center;
            width: 100%;
          }
          
          /* Para asegurar que el contenedor del textarea esté centrado */
          .description-row .input-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 560px; /* Limita el ancho máximo pero permite expansión */
          }
          .input-group label {
            color: #87c947;
            font-weight: 500;
            margin-bottom: 8px;
            display: block;
            font-size: 14px;
          }
          .form-field {
            padding: 10px 12px;
            border: 1px solid #4a5568;
            border-radius: 6px;
            background-color: #1a202c;
            color: white;
            width: 100%; /* Usa el ancho del contenedor */
            height: 40px;
            box-sizing: border-box;
            font-size: 14px;
            min-height: 40px; /* Garantiza altura mínima consistente */
            text-align: left; /* Asegura alineación consistente */
          }
          .form-field::placeholder {
            color: #718096;
          }
          .form-field:focus {
            border-color: #87c947;
            outline: none;
            box-shadow: 0 0 0 1px #87c947;
          }
          textarea.form-field {
            height: auto;
            min-height: 80px;
            resize: vertical;
            width: 100%; /* Usa el ancho del contenedor */
            max-width: 100%;
            padding: 12px; /* Consistente con los otros campos */
            box-sizing: border-box;
          }
          
          /* Asegurar que los labels de la descripción estén alineados a la izquierda */
          .description-row .input-group label {
            align-self: flex-start;
            width: 100%;
          }
          select.form-field {
            appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6"><path fill="%2387c947" d="M0 0l6 6 6-6z"/></svg>');
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 30px;
            width: 100%; /* Asegurar que ocupe todo el ancho */
          }
          
          /* Asegurar que todos los inputs tienen exactamente el mismo tamaño visual */
          select.form-field, input.form-field {
            min-width: 100%;
            max-width: 100%;
            width: 100%;
          }
          .swal2-popup {
            width: 660px !important; /* Aumentado para dar más espacio al formulario */
            padding: 1.5rem;
            box-sizing: border-box;
            background-color: #1e1e2f !important;
            border-radius: 15px !important;
            max-width: 95vw; /* Limitar en dispositivos pequeños */
          }
          .swal2-title {
            font-size: 1.8rem !important;
            margin-bottom: 1.5rem !important;
            color: white !important;
          }
          .swal2-html-container {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .swal2-actions {
            margin-top: 1.5rem !important;
            gap: 20px !important; /* Espacio específico entre botones */
            display: flex !important;
            justify-content: center !important; /* Centrar botones */
            width: 100% !important;
            padding: 0 !important; /* Eliminado el padding */
          }
          
          /* Clase personalizada para los botones */
          .swal2-actions-custom {
            width: 100% !important;
            max-width: 520px !important;
            margin: 0 auto !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          
          /* Asegurar que todos los elementos del botón tengan border-radius */
          .swal2-confirm *, .swal2-confirm.swal2-styled, .swal2-confirm.swal2-styled * {
            border-radius: 10px !important;
          }
          .swal2-confirm-button {
            flex: 1 !important; 
            width: 230px !important;
            min-width: 230px !important;
            max-width: 230px !important;
            padding: 0.8rem 1rem !important;
            font-weight: 600 !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
            border-radius: 10px !important; /* Border radius ajustado */
            box-shadow: 0 4px 8px rgba(135, 201, 71, 0.2) !important; /* Sombra sutil */
          }
          
          /* Estilos específicos para garantizar que el border-radius se aplique al botón guardar */
          .swal2-confirm {
            border-radius: 10px !important;
            overflow: hidden !important;
          }
          
          /* Estilos adicionales para asegurar que el borde redondeado se aplique */
          button.swal2-confirm {
            border-radius: 10px !important;
          }
          
          /* Override para SweetAlert2 */
          .swal2-styled.swal2-confirm {
            border-radius: 10px !important;
          }
          .swal2-cancel-button {
            flex: 1 !important;
            width: 230px !important;
            min-width: 230px !important;
            max-width: 230px !important;
            padding: 0.8rem 1rem !important;
            font-weight: 600 !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
            border-radius: 10px !important; /* Border radius ajustado */
            color: #e2e8f0 !important;
            background-color: #383a46 !important;
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "GUARDAR",
      cancelButtonText: "CANCELAR",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#383a46",
      background: "#1e1e2f",
      color: "#ffffff",
      buttonsStyling: true,
      confirmButtonAriaLabel: "Guardar servicio",
      cancelButtonAriaLabel: "Cancelar",
      borderRadius:
        "10px" /* Asegurar que el border-radius se aplique correctamente */,
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-button swal2-styled",
        cancelButton: "swal2-cancel-button swal2-styled",
        htmlContainer: "swal2-html-custom",
        actions:
          "swal2-actions-custom" /* Clase personalizada para los botones */,
      },
      showClass: {
        popup: "animate__animated animate__fadeIn animate__faster",
      },
      preConfirm: () => {
        // Obtener todos los valores del formulario
        const nombre = document.getElementById("nombre").value;
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
        const clientPhone = document.getElementById("clientPhone").value;
        const municipality = document.getElementById("municipality").value;
        const neighborhood = document.getElementById("neighborhood").value;
        const streetAddress = document.getElementById("streetAddress").value;
        const addressDetails =
          document.getElementById("addressDetails").value || "";
        const descripcion = document.getElementById("descripcion").value;

        // Construir dirección completa
        const fullAddress =
          `${municipality}, ${neighborhood}, ${streetAddress}, ${addressDetails}`.trim();

        if (
          !nombre ||
          !clientName ||
          !clientEmail ||
          !clientPhone ||
          !municipality ||
          !neighborhood ||
          !streetAddress ||
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
          address: fullAddress,
          municipality,
          neighborhood,
          streetAddress,
          addressDetails,
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
