import Swal from "sweetalert2";

const swalConfig = {
  confirmButtonColor: "#2ecc71",
  cancelButtonColor: "#95a5a6",
  background: "#f0fff4",
};

export const useAlertas = () => {
  const mostrarAlerta = (config) => {
    return Swal.fire({
      ...swalConfig,
      ...config,
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
