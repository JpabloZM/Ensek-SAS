// Este archivo configura globalmente SweetAlert2 para evitar que muestre el botón "NO" (denyButton)
import Swal from "sweetalert2";

// Modificar el constructor de SweetAlert para quitar denyButton siempre
const originalSwalConstructor = Swal.constructor;
Swal.constructor = function (params) {
  params = params || {};
  params.showDenyButton = false; // Forzar este valor siempre
  return originalSwalConstructor(params);
};

// Sobrescribir el método mixin
const originalMixin = Swal.mixin;
Swal.mixin = function (params) {
  params = params || {};
  params.showDenyButton = false; // Forzar este valor siempre
  return originalMixin(params);
};

// Sobrescribir el método fire para asegurar que showDenyButton siempre sea false
const originalFire = Swal.fire;
Swal.fire = function () {
  if (arguments.length > 0) {
    if (typeof arguments[0] === "object") {
      arguments[0] = {
        ...arguments[0],
        showDenyButton: false, // Forzar este valor siempre
      };
    } else if (arguments.length >= 3) {
      // Si se llamó con parámetros individuales, asegurar que showDenyButton sea false
      const params = {
        title: arguments[0],
        text: arguments[1],
        icon: arguments[2],
        showDenyButton: false,
      };
      return originalFire.call(this, params);
    }
  }
  return originalFire.apply(this, arguments);
};

export default Swal;
