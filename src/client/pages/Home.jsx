import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <header className="welcome-header">
        <h1>Bienvenido a ENSEK</h1>
      </header>
      <footer className="navbar">
        <div className="card-container">
          <div className="card">
            <h3>Control de Insectos</h3>
            <p>Elimina cucarachas, hormigas y más.</p>
          </div>
          <div className="card">
            <h3>Control de Roedores</h3>
            <p>Protege tu hogar de ratones y ratas.</p>
          </div>
          <div className="card">
            <h3>Fumigación Residencial</h3>
            <p>Soluciones para tu hogar.</p>
          </div>
          <div className="card">
            <h3>Fumigación Comercial</h3>
            <p>Protege tu negocio de plagas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
