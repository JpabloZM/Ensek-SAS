import React from "react";
import { useAlertas } from "../../hooks/useAlertas";

const CalendarHeader = ({ onAgregarTecnico }) => {
  const { mostrarAlerta } = useAlertas();

  return (
    <div className="calendar-header">
      <h2>Calendario de Servicios</h2>{" "}
      <div className="d-flex gap-2">
        <button onClick={onAgregarTecnico} className="btn btn-primary">
          <i className="fas fa-user-plus"></i> Agregar Técnico
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
