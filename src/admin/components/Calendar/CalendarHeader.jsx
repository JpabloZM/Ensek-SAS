import React from "react";
import { useAlertas } from "../../hooks/useAlertas";
import Swal from "sweetalert2";
import "./styles/calendar-header.css";
import "./styles/add-technician-button.css";

const CalendarHeader = ({ onAgregarTecnico }) => {
  const { mostrarAlerta } = useAlertas();

  const handleExportClick = () => {
    const currentDate = new Date().toISOString().split("T")[0];

    Swal.fire({
      title: "Exportar Calendario",
      html: `
        <div class="export-options">
          <p>Seleccione el formato de exportación para la fecha: <strong>${currentDate}</strong></p>
          <div class="export-format-buttons" style="display: flex; justify-content: center; margin-top: 20px; gap: 15px;">
            <button id="exportPDF" class="swal2-confirm swal2-styled" style="background-color: #87c947; padding: 12px 25px; border: 2px solid #004122; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <i class="fas fa-file-pdf" style="margin-right: 10px; font-size: 18px;"></i>PDF
            </button>
            <button id="exportCSV" class="swal2-confirm swal2-styled" style="background-color: #87c947; padding: 12px 25px; border: 2px solid #004122; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <i class="fas fa-file-csv" style="margin-right: 10px; font-size: 18px;"></i>CSV
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      focusCancel: false,
      didOpen: () => {
        // Función para exportar calendario
        const handleExport = (format) => {
          // Mostrar spinner mientras se procesa
          Swal.fire({
            title: "Generando exportación...",
            html: "Por favor espere mientras preparamos su archivo.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Llamar al endpoint de exportación
          console.log(
            `Exportando calendario para fecha ${currentDate}, formato ${format}`
          );
          fetch(`/api/exports?date=${currentDate}&format=${format}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((response) => {
              if (format === "pdf") {
                return response.blob();
              } else {
                return response.text();
              }
            })
            .then((data) => {
              // Cerrar el spinner
              Swal.close();

              // Crear un objeto URL para el blob (para PDF)
              if (format === "pdf") {
                const url = URL.createObjectURL(data);
                const a = document.createElement("a");
                a.href = url;
                a.download = `calendario_${currentDate}.pdf`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();

                mostrarAlerta({
                  icon: "success",
                  title: "Exportación PDF completada",
                  timer: 2000,
                  showConfirmButton: false,
                });
              } else {
                // Para CSV
                const url = window.URL.createObjectURL(
                  new Blob([data], { type: "text/csv" })
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `calendario_${currentDate}.csv`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();

                mostrarAlerta({
                  icon: "success",
                  title: "Exportación CSV completada",
                  timer: 2000,
                  showConfirmButton: false,
                });
              }
            })
            .catch((error) => {
              console.error("Error al exportar:", error);
              Swal.fire({
                icon: "error",
                title: "Error de exportación",
                text: "No se pudo generar el archivo de exportación. Por favor intente nuevamente.",
              });
            });
        };

        // Agregar eventos a los botones de formato
        document.getElementById("exportPDF").addEventListener("click", () => {
          handleExport("pdf");
          Swal.close();
        });
        document.getElementById("exportCSV").addEventListener("click", () => {
          handleExport("csv");
          Swal.close();
        });
      },
    });
  };

  return (
    <div className="calendar-header">
      <h2>Calendario de Servicios</h2>{" "}
      <div
        className="buttons-container"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        <button
          onClick={handleExportClick}
          className="btn-export-calendar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#87c947",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "12px 20px",
            height: "45px",
            fontSize: "16px",
            fontWeight: "500",
            width: "auto",
            minWidth: "190px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <i
            className="fas fa-file-export"
            style={{ marginRight: "8px", fontSize: "18px" }}
          ></i>
          <span style={{ whiteSpace: "nowrap" }}>Exportar Calendario</span>
        </button>
        <button
          onClick={onAgregarTecnico}
          className="btn btn-primary"
          style={{
            backgroundColor: "#87c947",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
            padding: "12px 20px",
            fontSize: "16px",
            height: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "auto",
            minWidth: "190px",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          <i
            className="fas fa-user-plus"
            style={{ marginRight: "8px", fontSize: "18px" }}
          ></i>
          <span style={{ whiteSpace: "nowrap" }}>Agregar Técnico</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
