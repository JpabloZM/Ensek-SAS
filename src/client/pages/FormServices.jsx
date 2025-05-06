import { Link } from "react-router-dom";
import "./FormServices.css";

const FormServices = () => {
  return (
    <div className="form-services">
      <h2>Agendar una Cita</h2>
      <form>
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
        <button type="submit" className="cta-button primary">
          Agendar Cita
        </button>
      </form>
      <Link to="/servicios" className="back-link">
        Volver a Servicios
      </Link>
    </div>
  );
};

export default FormServices;

