import React, { useState, useEffect } from "react";
import { inventoryService } from "../api/services";
import { useAlertas } from "../hooks/useAlertas";

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { mostrarAlerta } = useAlertas();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setServices(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los servicios");
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los servicios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await inventoryService.delete(id);
      setServices(services.filter((service) => service.id !== id));
      mostrarAlerta({
        icon: "success",
        title: "Éxito",
        text: "Servicio eliminado correctamente",
      });
    } catch (err) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el servicio",
      });
    }
  };

  if (loading) {
    return <div>Cargando servicios...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="services-list">
      <h2>Lista de Servicios</h2>
      {services.length === 0 ? (
        <p>No hay servicios disponibles</p>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-details">
                <span>
                  Cantidad: {service.quantity} {service.unit}
                </span>
                <span>Precio: ${service.unit_price}</span>
              </div>
              <div className="service-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    /* Implementar edición */
                  }}
                >
                  Editar
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(service.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
