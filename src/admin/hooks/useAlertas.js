import Swal from "sweetalert2";

export const useAlertas = () => {
  // Verificar si el modo oscuro está activo
  const isDarkMode = () => {
    return document.body.classList.contains("dark-theme");
  };

  // Función para forzar la actualización de las animaciones después de mostrar el diálogo
  const forceAnimationUpdate = () => {
    setTimeout(() => {
      const successIcons = document.querySelectorAll(
        ".swal2-icon.swal2-success"
      );
      if (successIcons.length > 0) {
        successIcons.forEach((icon) => {
          // Forzar repintado de los elementos
          icon.style.display = "none";
          void icon.offsetHeight; // Trigger reflow
          icon.style.display = "flex";

          // Asegurar que las líneas tengan las clases correctas
          const tipLine = icon.querySelector(".swal2-success-line-tip");
          const longLine = icon.querySelector(".swal2-success-line-long");

          if (tipLine) {
            tipLine.style.animation = "none";
            void tipLine.offsetHeight; // Trigger reflow
            tipLine.style.animation = "swal2-animate-success-line-tip 0.75s";
          }

          if (longLine) {
            longLine.style.animation = "none";
            void longLine.offsetHeight; // Trigger reflow
            longLine.style.animation = "swal2-animate-success-line-long 0.75s";
          }
        });
      }
    }, 50); // Pequeño retraso para asegurar que el diálogo esté completamente renderizado
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
    icon: "swal2-icon-custom-animation", // Clase personalizada para iconos
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
      didOpen: (popup) => {
        // Llamar al didOpen original si existe
        if (config.didOpen) {
          config.didOpen(popup);
        }
        // Forzar actualización de animaciones
        forceAnimationUpdate();
      },
    };
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
      ...getSwalConfig(),
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

  const mostrarFormulario = (titulo, html, tipo = "info") => {
    return Swal.fire({
      title: titulo,
      html: html,
      icon: tipo,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      ...getSwalConfig({
        confirmButtonColor: "#87c947",
        cancelButtonColor: isDarkMode() ? "#444" : "#dc3545",
      }),
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
