import React, { useState } from "react";
import { authService } from "../api/services";
import { useAlertas } from "../hooks/useAlertas";
import TestNavigation from "./TestNavigation";
import "./TestConnection.css";

const TestConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const { mostrarAlerta } = useAlertas();

  const testConnection = async () => {
    try {
      // Intentamos hacer login con credenciales de prueba
      const response = await authService.login({
        email: "admin@test.com",
        password: "admin123",
      });

      setTestResult({
        success: true,
        message: "Conexión exitosa",
        data: response,
      });

      mostrarAlerta({
        icon: "success",
        title: "Conexión Exitosa",
        text: "La conexión con la API se estableció correctamente",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error en la conexión",
        error: error.message,
      });

      mostrarAlerta({
        icon: "error",
        title: "Error de Conexión",
        text: `Error al conectar con la API: ${error.message}`,
      });
    }
  };

  return (
    <div>
      <TestNavigation />
      <div className="test-connection">
        <h2>Prueba de Conexión API</h2>
        <button onClick={testConnection} className="test-button">
          Probar Conexión
        </button>

        {testResult && (
          <div className={`result ${testResult.success ? "success" : "error"}`}>
            <h3>{testResult.message}</h3>
            <pre>
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection;
