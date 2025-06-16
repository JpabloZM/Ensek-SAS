import Swal from "sweetalert2";

const swalConfig = {
  confirmButtonColor: "#2ecc71",
  cancelButtonColor: "#95a5a6",
  background: "#f0fff4",
};

export const useAlertas = () => {
  const mostrarAlerta = (title, text, icon) => {
    // Si el primer parámetro es un objeto, usamos la configuración directamente
    if (typeof title === "object") {
      return Swal.fire({
        ...swalConfig,
        ...title,
      });
    }

    // Si se llama con parámetros individuales (título, texto, icono)
    return Swal.fire({
      ...swalConfig,
      title,
      text,
      icon,
    });
  };

  const mostrarConfirmacion = (config) => {
    return Swal.fire({
      ...swalConfig,
      ...config,
    });
  };

  return {
    mostrarAlerta,
    mostrarConfirmacion,
  };
};
