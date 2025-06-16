import Swal from "sweetalert2";

export const useAlertas = () => {
  const defaultClasses = {
    popup: "swal2-popup-custom",
    title: "swal2-title-custom",
    confirmButton: "swal2-confirm-custom",
    cancelButton: "swal2-cancel-custom",
    htmlContainer: "swal2-html-container",
  };

  const mostrarMensaje = async (tipo, mensaje) => {
    const iconos = {
      exito: "success",
      error: "error",
      advertencia: "warning",
      info: "info",
    };

    return await Swal.fire({
      icon: iconos[tipo] || "info",
      title: mensaje,
      customClass: defaultClasses,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const mostrarAlerta = async (title, text, icon) => {
    // Si el primer parámetro es un objeto, usamos la configuración directamente
    if (typeof title === "object") {
      const config = title;
      return await Swal.fire({
        ...config,
        customClass: {
          ...defaultClasses,
          ...(config.customClass || {}),
        },
      });
    }

    // Si se llama con parámetros individuales (título, texto, icono)
    return await Swal.fire({
      title,
      text,
      icon,
      customClass: defaultClasses,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const mostrarConfirmacion = async (config) => {
    return await Swal.fire({
      ...config,
      customClass: {
        ...defaultClasses,
        ...(config.customClass || {}),
      },
    });
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
    mostrarMensaje,
    mostrarAlerta,
    mostrarConfirmacion,
    mostrarFormulario,
  };
};

export default useAlertas;
