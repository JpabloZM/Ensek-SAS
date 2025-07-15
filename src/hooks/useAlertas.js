import Swal from "sweetalert2";

// Configuración base para todas las alertas
const swalConfig = {
  confirmButtonColor: "#2ecc71",
  cancelButtonColor: "#95a5a6",
  background: "#f0fff4",
  showDenyButton: false, // Desactivar siempre el botón "NO"
};

export const useAlertas = () => {
  const mostrarAlerta = (title, text, icon) => {
    // Si el primer parámetro es un objeto, usamos la configuración directamente
    if (typeof title === "object") {
      return Swal.fire({
        ...swalConfig,
        ...title,
        showDenyButton: false, // Asegurar que no se muestre el botón "NO"
      });
    }

    // Si se llama con parámetros individuales (título, texto, icono)
    return Swal.fire({
      ...swalConfig,
      title,
      text,
      icon,
      showDenyButton: false, // Asegurar que no se muestre el botón "NO"
    });
  };

  const mostrarConfirmacion = (config) => {
    return Swal.fire({
      ...swalConfig,
      ...config,
      showDenyButton: false, // Asegurar que no se muestre el botón "NO"
    });
  };

  return {
    mostrarAlerta,
    mostrarConfirmacion,
  };
};
