import { useState } from "react";
import { useAlertas } from "./useAlertas";

export const useTecnicos = () => {
  const [tecnicos, setTecnicos] = useState([
    { id: "1", title: "Francisco Londoño" },
    { id: "2", title: "Oscar Morales" },
    { id: "3", title: "Yeyferson Villada" },
    { id: "4", title: "Santiago Henao" },
    { id: "5", title: "German Oyola" },
    { id: "6", title: "Jhoan moreno" },
  ]);

  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  const agregarTecnico = async () => {
    const { value: nombreTecnico } = await mostrarConfirmacion({
      title: "Nuevo Técnico",
      input: "text",
      inputLabel: "Ingrese el nombre del nuevo técnico",
      inputPlaceholder: "Nombre del técnico",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Agregar",
      inputValidator: (value) => {
        if (!value) {
          return "Debe ingresar un nombre para el técnico";
        }
      },
    });

    if (nombreTecnico && nombreTecnico.trim()) {
      const nuevoId = (tecnicos.length + 1).toString();
      const nuevoTecnico = {
        id: nuevoId,
        title: nombreTecnico.trim(),
      };
      setTecnicos([...tecnicos, nuevoTecnico]);

      mostrarAlerta({
        position: "top-end",
        icon: "success",
        title: "Técnico agregado correctamente",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const eliminarTecnico = async (id) => {
    const result = await mostrarConfirmacion({
      title: "¿Eliminar Técnico?",
      text: "¿Está seguro de que desea eliminar este técnico? Se eliminarán todos sus servicios asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setTecnicos(tecnicos.filter((t) => t.id !== id));
      mostrarAlerta({
        icon: "success",
        title: "Eliminado",
        text: "El técnico ha sido eliminado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const actualizarTecnico = async (id, nuevoNombre) => {
    setTecnicos(
      tecnicos.map((t) => (t.id === id ? { ...t, title: nuevoNombre } : t))
    );

    mostrarAlerta({
      position: "top-end",
      icon: "success",
      title: "Nombre actualizado",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  return {
    tecnicos,
    agregarTecnico,
    eliminarTecnico,
    actualizarTecnico,
  };
};
