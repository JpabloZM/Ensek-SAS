/**
 * Función para agregar estilos CSS inline
 * para corregir problemas con los botones de SweetAlert2
 */

// Función para agregar estilos CSS para corregir los iconos en botones
export function addButtonFixStyles() {
  // Si ya existe el estilo, no agregar otro
  if (document.getElementById("button-icon-fix-styles")) {
    return;
  }

  // Crear elemento style
  const styleElement = document.createElement("style");
  styleElement.id = "button-icon-fix-styles";
  styleElement.innerHTML = `
    /* Estilos directos para corregir problema de iconos en botones */
    .swal2-actions button i,
    .swal2-actions button span i,
    .swal2-styled i {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }
    
    .swal2-confirm,
    .swal2-cancel {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    
    /* Solución para asegurar que el color del texto es correcto */
    .swal2-confirm i,
    .swal2-cancel i {
      color: inherit !important;
    }
    
    /* Fix específico para el botón Asignar */
    .swal2-styled.swal2-confirm {
      position: relative;
    }
    
    /* Asegurar que el contenido está por encima */
    .swal2-confirm > *,
    .swal2-cancel > * {
      position: relative !important;
      z-index: 2 !important;
    }
    
    /* Aplicar el color de fondo directamente al ícono */
    .swal2-confirm i::before,
    .swal2-cancel i::before {
      position: relative;
      z-index: 2;
    }
    
    /* Resets específicos para elementos del botón */
    .swal2-confirm span,
    .swal2-cancel span {
      background: transparent !important;
    }
  `;

  // Agregar al head del documento
  document.head.appendChild(styleElement);
}

// Función para agregar un script que modifique los botones después de que SweetAlert los cree
export function addButtonFixScript() {
  // Si ya existe el script, no agregar otro
  if (document.getElementById("button-icon-fix-script")) {
    return;
  }

  // Crear elemento script
  const scriptElement = document.createElement("script");
  scriptElement.id = "button-icon-fix-script";
  scriptElement.innerHTML = `
    // Función para aplicar arreglos a los botones de SweetAlert2
    function fixSweetAlertButtons() {
      // Observar cambios en el DOM para detectar cuando se agreguen modales de SweetAlert2
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (node.classList && node.classList.contains('swal2-container')) {
                // Encontramos un modal SweetAlert2
                const confirmButton = node.querySelector('.swal2-confirm');
                const cancelButton = node.querySelector('.swal2-cancel');
                
                // Arreglar botón de confirmar
                if (confirmButton) {
                  const iconElements = confirmButton.querySelectorAll('i');
                  iconElements.forEach(icon => {
                    icon.style.backgroundColor = 'transparent';
                    icon.style.background = 'none';
                  });
                }
                
                // Arreglar botón de cancelar
                if (cancelButton) {
                  const iconElements = cancelButton.querySelectorAll('i');
                  iconElements.forEach(icon => {
                    icon.style.backgroundColor = 'transparent';
                    icon.style.background = 'none';
                  });
                }
              }
            }
          }
        });
      });
      
      // Comenzar a observar el documento
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Ejecutar la función cuando el documento esté listo
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fixSweetAlertButtons();
    } else {
      document.addEventListener('DOMContentLoaded', fixSweetAlertButtons);
    }
  `;

  // Agregar al final del body
  document.body.appendChild(scriptElement);
}
