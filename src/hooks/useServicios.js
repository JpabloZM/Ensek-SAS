import { useState } from "react";
import { useAlertas } from "./useAlertas";

export const useServicios = () => {
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  const agregarServicioPendiente = async () => {
    const { value: formValues } = await mostrarConfirmacion({
      title: "Nuevo Servicio Pendiente",
      html: `
        <input id="swal-titulo" class="swal2-input" placeholder="Título del servicio">
        <input id="swal-duracion" class="swal2-input" type="number" placeholder="Duración (minutos)">
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción del servicio"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Agregar",
      preConfirm: () => {
        const titulo = document.getElementById("swal-titulo").value;
        const duracion = document.getElementById("swal-duracion").value;
        const descripcion = document.getElementById("swal-descripcion").value;

        if (!titulo || !duracion) {
          mostrarAlerta({
            icon: "error",
            title: "Error",
            text: "Por favor complete los campos requeridos",
          });
          return false;
        }

        return {
          titulo: titulo,
          duracion: duracion,
          descripcion: descripcion || "Sin descripción",
        };
      },
    });

    if (formValues) {
      const nuevoServicio = {
        id: Date.now().toString(),
        ...formValues,
      };

      setServiciosPendientes([...serviciosPendientes, nuevoServicio]);

      mostrarAlerta({
        position: "top-end",
        icon: "success",
        title: "Servicio agregado",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const eliminarServicioPendiente = (id) => {
    setServiciosPendientes(serviciosPendientes.filter((s) => s.id !== id));
  };

  return {
    serviciosPendientes,
    agregarServicioPendiente,
    eliminarServicioPendiente,
  };
};
