import React, { useState, useEffect } from "react";
import { useServices } from "../hooks/useServices";
import { useAlertas } from "../hooks/useAlertas";

const ServicesList = () => {
  const { services, loading, error, refetch } = useServices();
  const { mostrarAlerta } = useAlertas();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async (id) => {
    try {
      await inventoryService.delete(id);
      refetch();
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
