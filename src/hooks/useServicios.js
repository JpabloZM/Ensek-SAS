import { useState, useEffect } from "react";
import { useAlertas } from "./useAlertas";

export const useServicios = () => {
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  useEffect(() => {
    const serviciosGuardados =
      JSON.parse(localStorage.getItem("serviciosPendientes")) || [];
    setServiciosPendientes(serviciosGuardados);
  }, []);

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

      const serviciosActualizados = [...serviciosPendientes, nuevoServicio];
      setServiciosPendientes(serviciosActualizados);
      localStorage.setItem(
        "serviciosPendientes",
        JSON.stringify(serviciosActualizados)
      );

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
    const serviciosActualizados = serviciosPendientes.filter(
      (s) => s.id !== id
    );
    setServiciosPendientes(serviciosActualizados);
    localStorage.setItem(
      "serviciosPendientes",
      JSON.stringify(serviciosActualizados)
    );
  };

  return {
    serviciosPendientes,
    agregarServicioPendiente,
    eliminarServicioPendiente,
  };
};
