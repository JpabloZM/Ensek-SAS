import React from "react";
import { useAlertas } from "../../hooks/useAlertas";
import Swal from "sweetalert2";
import "./styles/servicio-card.css";

const ServicioCard = ({ servicio, onEliminar, onAsignarServicio }) => {
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  const handleClick = async (e) => {
    if (!e.target.closest(".eliminar-servicio")) {
      await mostrarAlerta({
        title: servicio.nombre,
        html: `
          <div class="text-left">
            <p style="color: #004122; margin-bottom: 1rem;">
              <strong><i class="fas fa-clock" style="color: #87c947;"></i> Duración:</strong> 
              ${servicio.duracion} minutos
            </p>
            <p style="color: #004122;">
              <strong><i class="fas fa-info-circle" style="color: #87c947;"></i> Descripción:</strong>
              ${servicio.descripcion}
            </p>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#87c947",
        background: "#ffffff",
        color: "#004122",
      });
    }
  };

  const handleContextMenu = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: servicio.nombre,
      html: `
        <div class="d-flex gap-2" style="
        justify-content: center;
        display: flex;
        flex-direction: row;
        gap: 1rem;
        ">
          <button class="btn w-100" id="btnAsignar" 
          style="
          background-color: #87c947; color: white; 
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          ">

            <i class="fas fa-calendar-plus me-2"></i>Asignar al Calendario
          </button>

          <button class="btn btn-danger w-100" id="btnEliminar" 
          style="
          background-color: #e74c3c; color: white; 
          border: none; 
          border-radius: 8px;
          padding: 0.7rem 1rem;
          ">

            <i class="fas fa-trash-alt me-2"></i>Eliminar
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: false,
      background: "#ffffff",
      color: "#004122",
      didOpen: () => {
        const btnAsignar = Swal.getPopup().querySelector("#btnAsignar");
        const btnEliminar = Swal.getPopup().querySelector("#btnEliminar");

        btnAsignar.addEventListener("mouseover", () => {
          btnAsignar.style.backgroundColor = "#6fa33c";
        });
        btnAsignar.addEventListener("mouseout", () => {
          btnAsignar.style.backgroundColor = "#87c947";
        });
        btnAsignar.addEventListener("click", () => {
          Swal.close();
          handleAsignarCalendario();
        });
        btnEliminar.addEventListener("click", () => {
          Swal.close();
          handleEliminar(e);
        });
      },
    });
  };

  const handleAsignarCalendario = async () => {
    const tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];

    const { value: formValues } = await mostrarAlerta({
      title: "Asignar al Calendario",
      html: `
        <form id="asignarForm" class="text-left">
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Técnico</label>
            <select id="tecnicoSelect" class="form-control" required style="border-color: #c5f198;">
              <option value="">Seleccione un técnico</option>
              ${tecnicos
                .map(
                  (tecnico) => `
                <option value="${tecnico.id}">${tecnico.title}</option>
              `
                )
                .join("")}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Fecha</label>
            <input type="date" id="fecha" class="form-control" required style="border-color: #c5f198;" value="${
              new Date().toISOString().split("T")[0]
            }">
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #004122;">Hora de inicio</label>
            <input type="time" id="horaInicio" class="form-control" required style="border-color: #c5f198;">
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#e74c3c",
      background: "#ffffff",
      color: "#004122",
      preConfirm: () => {
        const tecnicoId = document.getElementById("tecnicoSelect").value;
        const fecha = document.getElementById("fecha").value;
        const horaInicio = document.getElementById("horaInicio").value;

        if (!tecnicoId || !fecha || !horaInicio) {
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

        return { tecnicoId, fecha, horaInicio };
      },
    });

    if (formValues) {
      const { tecnicoId, fecha, horaInicio } = formValues;
      const tecnico = tecnicos.find((t) => t.id === tecnicoId);

      // Calcular fecha y hora de inicio y fin
      const fechaInicio = new Date(`${fecha}T${horaInicio}`);
      const fechaFin = new Date(
        fechaInicio.getTime() + servicio.duracion * 60000
      );

      // Crear nuevo evento
      const nuevoEvento = {
        id: Date.now().toString(),
        title: servicio.nombre,
        start: fechaInicio.toISOString(),
        end: fechaFin.toISOString(),
        backgroundColor: servicio.color,
        borderColor: servicio.color,
        resourceId: tecnicoId,
        extendedProps: {
          descripcion: servicio.descripcion,
          tecnico: tecnico.title,
          estado: "pendiente",
        },
      };

      // Agregar el evento al calendario
      onAsignarServicio(nuevoEvento);

      // Eliminar el servicio de los pendientes
      onEliminar();

      mostrarAlerta({
        icon: "success",
        title: "Servicio Asignado",
        text: "El servicio ha sido asignado al calendario correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    const result = await mostrarConfirmacion({
      title: "¿Eliminar Servicio Pendiente?",
      text: "¿Está seguro de que desea eliminar este servicio pendiente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#87c947",
      background: "#ffffff",
      color: "#004122",
    });

    if (result.isConfirmed) {
      onEliminar();
      mostrarAlerta({
        icon: "success",
        title: "Eliminado",
        text: "El servicio pendiente ha sido eliminado",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8ffec",
        color: "#004122",
      });
    }
  };

  return (
    <div
      className="servicio-card"
      draggable={true}
      data-servicio={JSON.stringify(servicio)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div className="contenido-servicio">
          <h5>
            <i className="fas fa-tag icon-primary"></i> {servicio.nombre}
          </h5>
          <p className="mb-1">
            <i className="fas fa-clock icon-primary"></i> {servicio.duracion} minutos
          </p>
          <p className="mb-0 descripcion-truncada">
            <i className="fas fa-info-circle icon-primary"></i> {servicio.descripcion}
          </p>
        </div>
        <button
          className="btn btn-link text-danger p-0 eliminar-servicio"
          onClick={handleEliminar}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default ServicioCard;
