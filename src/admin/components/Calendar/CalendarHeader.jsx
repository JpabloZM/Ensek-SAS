import React from "react";
import { useAlertas } from "../../hooks/useAlertas";

const CalendarHeader = ({ onExportar, onAgregarTecnico }) => {
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  const handleExportar = async () => {
    const { value: formato } = await mostrarConfirmacion({
      title: "Exportar Calendario",
      text: "Seleccione el formato de exportación",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      showDenyButton: true,
      confirmButtonText: '<i class="fas fa-image"></i> Imagen',
      denyButtonText: '<i class="fas fa-file-pdf"></i> PDF',
      confirmButtonColor: "#2ecc71",
      denyButtonColor: "#e74c3c",
    });

    if (formato === true) {
      mostrarAlerta({
        title: "Exportando...",
        text: "Por favor espere mientras se genera la imagen",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });
      // Implementar exportación a imagen
    } else if (formato === false) {
      mostrarAlerta({
        title: "Exportando...",
        text: "Por favor espere mientras se genera el PDF",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });
      // Implementar exportación a PDF
    }
  };

  return (
    <div className="calendar-header">
      <h2>Calendario de Servicios</h2>
      <div className="d-flex gap-2">
        <button
          onClick={handleExportar}
          className="btn btn-outline-primary btn-export"
          title="Exportar Calendario"
        >
          <i className="fas fa-file-export me-1"></i>
          <span>Exportar</span>
        </button>
        <button onClick={onAgregarTecnico} className="btn btn-primary">
          <i className="fas fa-user-plus"></i> Agregar Técnico
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
