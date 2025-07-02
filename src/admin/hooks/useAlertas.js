import Swal from "sweetalert2";

export const useAlertas = () => {
  // Verificar si el modo oscuro está activo
  const isDarkMode = () => {
    return document.body.classList.contains("dark-theme");
  };

  // Clases CSS personalizadas para los componentes de SweetAlert2
  const defaultClasses = {
    popup: `swal2-popup-custom ${isDarkMode() ? "dark-theme" : ""}`,
    title: "swal2-title-custom",
    confirmButton: "swal2-confirm-custom",
    cancelButton: "swal2-cancel-custom",
    htmlContainer: "swal2-html-container",
    input: isDarkMode() ? "dark-input" : "",
    select: isDarkMode() ? "dark-select" : "",
  };

  // Configuración adaptada al tema
  const getSwalConfig = (config = {}) => {
    const darkMode = isDarkMode();
    return {
      ...config,
      background: darkMode ? "#1a1c22" : "#fff",
      color: darkMode ? "#fff" : "#000",
      confirmButtonColor: config.confirmButtonColor || "#87c947",
      cancelButtonColor:
        config.cancelButtonColor || (darkMode ? "#444" : "#d33"),
    };
  };

  // Mostrar un mensaje simple
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
      ...getSwalConfig(),
    });
  };

  // Mostrar una alerta con más opciones
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
        ...getSwalConfig(config),
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
      ...getSwalConfig(),
    });
  };

  // Mostrar un diálogo de confirmación
  const mostrarConfirmacion = async (config) => {
    return await Swal.fire({
      ...config,
      customClass: {
        ...defaultClasses,
        ...(config.customClass || {}),
      },
      ...getSwalConfig(config),
    });
  };

  // Mostrar un formulario
  const mostrarFormulario = (titulo, html, tipo = "info") => {
    return Swal.fire({
      title: titulo,
      html: html,
      icon: tipo,
      showCancelButton: true,
      confirmButtonColor: "#87c947",
      cancelButtonColor: isDarkMode() ? "#444" : "#dc3545",
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      ...getSwalConfig(),
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
