// Configuración global para SweetAlert2
import Swal from "sweetalert2";

// Crear una instancia con configuración por defecto
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showDenyButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Función para determinar si estamos en modo oscuro
const isDarkMode = () => {
  return document.body.classList.contains("dark-theme");
};

// Función para crear configuración con tema oscuro si es necesario
const withDarkMode = (config) => {
  const darkMode = isDarkMode();
  if (darkMode) {
    return {
      ...config,
      background: "#1a1c22",
      color: "#fff",
      // Asegurar que los botones conserven sus colores correctos
      confirmButtonColor: config.confirmButtonColor || "#87c947",
      cancelButtonColor: config.cancelButtonColor || "#444",
      customClass: {
        ...(config.customClass || {}),
        popup: `${config.customClass?.popup || ""} dark-theme`.trim(),
        // Mantener las clases personalizadas para los elementos de SweetAlert2
        input: "swal2-input dark-input",
        select: "swal2-select dark-select",
      },
    };
  }
  return config;
};

// Función para mostrar alerta con verificación de tema
const showAlert = (config) => {
  const finalConfig = withDarkMode({ ...config, showDenyButton: false });
  return Swal.fire(finalConfig);
};

// Función para mostrar toast con verificación de tema
const showToast = (config) => {
  const finalConfig = withDarkMode({ ...config, showDenyButton: false });
  return Toast.fire(finalConfig);
};

export { showAlert, showToast, withDarkMode };
