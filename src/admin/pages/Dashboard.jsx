import { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    serviciosPendientes: 5,
    serviciosHoy: 3,
    serviciosCompletados: 12,
    tecnicosActivos: 4,
  });

  const [solicitudesRecientes, setSolicitudesRecientes] = useState([
    {
      id: 1,
      cliente: "Juan Pérez",
      servicio: "Mantenimiento Preventivo",
      fecha: "2024-03-21",
      estado: "Pendiente",
    },
    {
      id: 2,
      cliente: "María López",
      servicio: "Reparación de Emergencia",
      fecha: "2024-03-21",
      estado: "Confirmado",
    },
    {
      id: 3,
      cliente: "Carlos Ruiz",
      servicio: "Instalación de Equipos",
      fecha: "2024-03-22",
      estado: "En Proceso",
    },
  ]);

  return (
    <div className="dashboard">
      <h1>Panel de Control</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-clock"></i>
          <div className="stat-info">
            <h3>Servicios Pendientes</h3>
            <p>{stats.serviciosPendientes}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-calendar-day"></i>
          <div className="stat-info">
            <h3>Servicios Hoy</h3>
            <p>{stats.serviciosHoy}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <div className="stat-info">
            <h3>Servicios Completados</h3>
            <p>{stats.serviciosCompletados}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div className="stat-info">
            <h3>Técnicos Activos</h3>
            <p>{stats.tecnicosActivos}</p>
          </div>
        </div>
      </div>

      <section className="recent-requests">
        <h2>Solicitudes Recientes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesRecientes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.cliente}</td>
                  <td>{solicitud.servicio}</td>
                  <td>{solicitud.fecha}</td>
                  <td>
                    <span
                      className={`estado-${solicitud.estado.toLowerCase()}`}
                    >
                      {solicitud.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ver">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-editar">
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
