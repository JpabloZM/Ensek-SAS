import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/swal-override.css"; // Importar CSS para ocultar el botón "NO" en SweetAlert2
import { setupFavicon } from "./favicon-setup";

// Configurar el favicon usando la imagen de assets
setupFavicon();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
