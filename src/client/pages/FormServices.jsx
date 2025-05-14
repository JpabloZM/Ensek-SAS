import { useState } from "react";
import { Link } from "react-router-dom";
import "./FormServices.css";

const FormServices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular envío del formulario
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Aquí iría tu lógica de envío real
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Partículas flotantes */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>

      {/* Puntos decorativos */}
      <div className="decoration-dots left"></div>
      <div className="decoration-dots right"></div>

      <div className="form-services">

        {/* Efecto de círculo con estela */}
        <div className="circle-trail left"></div>
        <div className="circle-trail right"></div>

        <h2>Agendar una Cita</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input type="text" id="name" placeholder="Tu nombre" required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input type="tel" id="phone" placeholder="Tu teléfono" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" placeholder="Tu correo" required />
          </div>
          <div className="form-group">
            <label htmlFor="date">Fecha Previa</label>
            <input type="date" id="date" required />
          </div>
          <div className="form-group">
            <label htmlFor="pest-type">Tipo de Plaga</label>
            <select id="pest-type" required>
              <option value="">Selecciona una opción</option>
              <option value="cucarachas">Cucarachas</option>
              <option value="termitas">Termitas</option>
              <option value="roedores">Roedores</option>
              <option value="hormigas">Hormigas</option>
              <option value="otras">Otras</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comments">Comentarios Adicionales</label>
            <textarea
              id="comments"
              rows="4"
              placeholder="Escribe tus comentarios"
            ></textarea>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className={`cta-button primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              <span className="button-content">
                {isLoading ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Agendar Cita'
                )}
              </span>
            </button>
            <Link to="/servicios" className="back-link">
              Volver a Servicios
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormServices;

