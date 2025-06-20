import React, { useState, useEffect, useRef } from 'react';
import { useServices } from '../../../hooks/useServices';
import { useAlertas } from '../../../hooks/useAlertas';
import './PendingServicesCards.css';

const PendingServicesCards = () => {
  const { services, loading, error, getAllServices, updateService, deleteService } = useServices();
  const { mostrarAlerta } = useAlertas();
  const [pendingServices, setPendingServices] = useState([]);
  const refreshTimeoutRef = useRef(null);
  
  // Just check for user login
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      console.warn("No user logged in. Cannot fetch pending services.");
    }
    
    // Clear any existing refresh timer on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    // Filtrar los servicios pendientes cuando se carguen los servicios
    if (services && Array.isArray(services)) {
      const filtered = services.filter(service => service.status === 'pending');
      setPendingServices(filtered);
    }
  }, [services]);

  const handleViewDetails = (service) => {
    mostrarAlerta({
      title: `Detalles del Servicio: ${service.serviceType}`,
      html: `
        <div class="service-details-popup">
          <p><strong>Cliente:</strong> ${service.name}</p>
          <p><strong>Contacto:</strong> ${service.email} | ${service.phone}</p>
          <p><strong>Dirección:</strong> ${service.address}</p>
          <p><strong>Fecha preferida:</strong> ${new Date(service.preferredDate).toLocaleString()}</p>
          <p><strong>Descripción:</strong> ${service.description}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#87c947',
      background: '#f8ffec',
      color: '#004122',
    });
  };  const handleUpdateStatus = async (service, newStatus) => {
    try {
      // Actualizar el servicio en la API
      await updateService(service._id, { status: newStatus });
      
      // Actualizar la lista local
      const updatedServices = pendingServices.filter(s => s._id !== service._id);
      setPendingServices(updatedServices);
      
      mostrarAlerta({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El servicio ha sido marcado como ${newStatus === 'confirmed' ? 'confirmado' : newStatus === 'completed' ? 'completado' : 'cancelado'}`,
        confirmButtonColor: '#87c947',
        background: '#f8ffec',
        color: '#004122',
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      mostrarAlerta({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del servicio',
        confirmButtonColor: '#87c947',
        background: '#f8ffec', 
        color: '#004122',
      });
    }
  };

  const handleEliminarServicio = async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error("ID de servicio no proporcionado");
      }

      const confirmResult = await mostrarAlerta({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar este servicio? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      await deleteService(serviceId);

      // Actualizar la lista de servicios pendientes localmente
      setPendingServices(prevServices => 
        prevServices.filter(service => service._id !== serviceId)
      );

      // Recargar todos los servicios
      await getAllServices(true);

      mostrarAlerta({
        title: "¡Éxito!",
        text: "El servicio ha sido eliminado correctamente",
        icon: "success"
      });
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      mostrarAlerta({
        title: "Error",
        text: error.message || "No se pudo eliminar el servicio",
        icon: "error"
      });
    }
  };

  if (loading) {
    return <div className="loading-message">Cargando servicios pendientes...</div>;
  }
  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('401') || 
                        error.includes('unauthorized') || 
                        error.includes('token');
    
    return (
      <div className="recent-requests">
        <h2>Servicios Pendientes</h2>
        <div className="error-message">
          <p>
            {isAuthError 
              ? "Error de autenticación: Por favor inicie sesión nuevamente." 
              : `Error al cargar servicios: ${error}`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            {isAuthError && (
              <button 
                onClick={() => window.location.href = '/login'} 
                style={{ padding: '5px 10px', background: '#004122', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Iniciar sesión
              </button>
            )}              <button 
              className="btn-retry" 
              onClick={() => getAllServices(true)}
              style={{ padding: '5px 10px', background: '#87c947', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="recent-requests">
      <h2>Servicios Pendientes</h2>
      
      {pendingServices.length === 0 ? (
        <p className="no-services-message">No hay servicios pendientes</p>
      ) : (
        <div className="servicios-container">
          {pendingServices.map(service => (
            <div className="servicio-card" key={service._id} onClick={() => handleViewDetails(service)}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="contenido-servicio">
                  <h5>
                    <i className="fas fa-tag icon-primary"></i> {getServiceTypeLabel(service.serviceType)}
                  </h5>
                  <p className="mb-1">
                    <i className="fas fa-user icon-primary"></i> {service.name}
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-phone icon-primary"></i> {service.phone}
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-calendar-alt icon-primary"></i> {formatDate(service.preferredDate)}
                  </p>
                  <p className="mb-0 descripcion-truncada">
                    <i className="fas fa-info-circle icon-primary"></i> {truncateText(service.description, 60)}
                  </p>
                </div>
                
                <div className="botones-container">
                  <button
                    className="btn btn-link text-success p-0 confirmar-servicio"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(service, 'confirmed');
                    }}
                  >
                    <i className="fas fa-check-circle"></i>
                  </button>
                  <button
                    className="btn btn-link text-danger p-0 eliminar-servicio"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarServicio(service._id);
                    }}
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
const getServiceTypeLabel = (type) => {
  const types = {
    'pest-control': 'Control de Plagas',
    'gardening': 'Jardinería',
    'residential-fumigation': 'Fumigación Residencial',
    'commercial-fumigation': 'Fumigación Comercial',
    'fumigation': 'Fumigación',
    'other': 'Otro Servicio'
  };
  
  return types[type] || 'Servicio';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default PendingServicesCards;
