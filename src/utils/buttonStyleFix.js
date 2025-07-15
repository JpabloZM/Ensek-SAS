/* Enfoque directo para estilizar botones */

/**
 * Esta función aplica estilos directos a un botón para corregir problemas de iconos
 * @param {HTMLElement} button - El botón al que aplicar los estilos
 */
function applyButtonIconFix(button) {
  if (!button) return;
  
  // Aplicar estilos directamente al botón
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.gap = '8px';
  
  // Encontrar y corregir los iconos
  const icons = button.querySelectorAll('i');
  icons.forEach(icon => {
    // Remover cualquier fondo
    icon.style.background = 'none !important';
    icon.style.backgroundColor = 'transparent !important';
    // Asegurar que el color coincida con el texto
    icon.style.color = 'inherit';
  });
}

/**
 * Función para ser utilizada con SweetAlert2 cuando se abre un modal
 */
export function fixSweetAlertButtons() {
  // Obtener los botones del modal actual
  setTimeout(() => {
    // Botones de SweetAlert2
    const confirmButton = document.querySelector('.swal2-confirm');
    const cancelButton = document.querySelector('.swal2-cancel');
    
    // Aplicar el fix a los botones
    applyButtonIconFix(confirmButton);
    applyButtonIconFix(cancelButton);
    
    // Asegurarse de que los iconos tengan el mismo color que el texto
    if (confirmButton) {
      const icons = confirmButton.querySelectorAll('i');
      icons.forEach(icon => {
        icon.style.color = window.getComputedStyle(confirmButton).color;
      });
    }
    
    if (cancelButton) {
      const icons = cancelButton.querySelectorAll('i');
      icons.forEach(icon => {
        icon.style.color = window.getComputedStyle(cancelButton).color;
      });
    }
  }, 10); // Pequeño timeout para asegurar que los elementos están en el DOM
}

export default {
  applyButtonIconFix,
  fixSweetAlertButtons
};
