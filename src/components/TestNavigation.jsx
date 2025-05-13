import React from "react";
import { Link, useLocation } from "react-router-dom";

const TestNavigation = () => {
  const location = useLocation();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Navegación de Prueba</h2>
      <nav style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <Link
          to="/"
          style={{
            color: location.pathname === "/" ? "#004122" : "#87c947",
            textDecoration: "none",
            fontWeight: location.pathname === "/" ? "bold" : "normal",
          }}
        >
          Inicio
        </Link>
        <Link
          to="test-connection"
          style={{
            color:
              location.pathname === "/test-connection" ? "#004122" : "#87c947",
            textDecoration: "none",
            fontWeight:
              location.pathname === "/test-connection" ? "bold" : "normal",
          }}
        >
          Prueba de Conexión
        </Link>
        <Link
          to="admin/login"
          style={{
            color: location.pathname === "/admin/login" ? "#004122" : "#87c947",
            textDecoration: "none",
            fontWeight:
              location.pathname === "/admin/login" ? "bold" : "normal",
          }}
        >
          Login Admin
        </Link>
      </nav>
    </div>
  );
};

export default TestNavigation;
