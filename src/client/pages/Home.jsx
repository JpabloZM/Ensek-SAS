import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa"; // Asegúrate de tener react-icons instalado
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-logo">ENSEK</div>
        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/services">Services</Link>
        </nav>
        <div className="navbar-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        </div>
      </header>
      <main className="content">
        <h1>Bienvenido a ENSEK</h1>
        <p>Servicios especializados en jardinería y control de plagas.</p>
      </main>
    </div>
  );
};

export default Home;

