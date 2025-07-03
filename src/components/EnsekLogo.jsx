import React from "react";
import { Link } from "react-router-dom";
import "./EnsekLogo.css";
import logoImage from "../assets/images/Logo-removebg.png";

/**
 * Componente de logo estilizado para ENSEK
 * Muestra el logo con el estilo circular verde con la E central
 */
const EnsekLogo = ({ size = "medium", className = "" }) => {
  // Tamaños predefinidos
  const sizes = {
    small: { width: 30, height: 30 },
    medium: { width: 50, height: 50 },
    large: { width: 80, height: 80 },
    xlarge: { width: 120, height: 120 },
  };

  const dimensions = sizes[size] || sizes.medium;

  return (
    <div
      className={`ensek-logo-container ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div className="ensek-logo-wrapper">
        <img src={logoImage} alt="ENSEK Logo" className="ensek-logo-image" />
      </div>
    </div>
  );
};

/**
 * Componente de logo con enlace
 */
export const EnsekLogoLink = ({
  to = "/",
  size = "medium",
  className = "",
}) => {
  return (
    <Link to={to} className="ensek-logo-link">
      <EnsekLogo size={size} className={className} />
    </Link>
  );
};

export default EnsekLogo;
