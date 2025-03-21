import Swal from "sweetalert2";

export const useAlertas = () => {
  const defaultClasses = {
    popup: "swal2-popup-custom",
    title: "swal2-title-custom",
    confirmButton: "swal2-confirm-custom",
    cancelButton: "swal2-cancel-custom",
    htmlContainer: "swal2-html-container",
  };

  const mostrarAlerta = async (config) => {
    const configConClases = {
      ...config,
      customClass: {
        ...defaultClasses,
        ...(config.customClass || {}),
      },
    };
    return await Swal.fire(configConClases);
  };

  const mostrarConfirmacion = async (config) => {
    const configConClases = {
      ...config,
      customClass: {
        ...defaultClasses,
        ...(config.customClass || {}),
      },
    };
    return await Swal.fire(configConClases);
  };

  const mostrarFormulario = (titulo, html, tipo = "info") => {
    return Swal.fire({
      title: titulo,
      html: html,
      icon: tipo,
      showCancelButton: true,
      confirmButtonColor: "#87c947",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });
  };

  return {
    mostrarAlerta,
    mostrarConfirmacion,
    mostrarFormulario,
  };
};

export default useAlertas;
