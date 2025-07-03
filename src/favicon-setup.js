// Este archivo configura el favicon dinámicamente para usar la imagen de assets
import logoImage from "./assets/images/Logo-removebg.png";

// Función para configurar el favicon dinámicamente
export function setupFavicon() {
  // Eliminar cualquier favicon existente
  const existingFavicons = document.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  existingFavicons.forEach((favicon) => favicon.remove());

  // Crear nuevos elementos link para el favicon
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = logoImage;
  document.head.appendChild(favicon);

  // Para dispositivos Apple
  const appleTouchIcon = document.createElement("link");
  appleTouchIcon.rel = "apple-touch-icon";
  appleTouchIcon.href = logoImage;
  document.head.appendChild(appleTouchIcon);

  // Para compatibilidad con navegadores antiguos
  const shortcutIcon = document.createElement("link");
  shortcutIcon.rel = "shortcut icon";
  shortcutIcon.type = "image/png";
  shortcutIcon.href = logoImage;
  document.head.appendChild(shortcutIcon);
}
