import Swal from "sweetalert2";

// Configuración global para SweetAlert2
const configureSwal = () => {
  const defaultOptions = {
    showDenyButton: false, // Esto desactiva el botón "NO" en todos los modales
  };

  // Crear una instancia personalizada de SweetAlert con nuestras opciones por defecto
  const CustomSwal = Swal.mixin(defaultOptions);

  // Reemplazar el método fire global para asegurarnos que siempre se use nuestra configuración
  const originalFire = Swal.fire;
  Swal.fire = function (...args) {
    // Si se pasa un objeto de configuración, combinar con nuestras opciones por defecto
    if (typeof args[0] === "object") {
      args[0] = { ...defaultOptions, ...args[0] };
    }
    // Llamar al método original
    return originalFire.apply(this, args);
  };

  return CustomSwal;
};

// Inicializar la configuración global
const CustomSwal = configureSwal();

export default CustomSwal;
