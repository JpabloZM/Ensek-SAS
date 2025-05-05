import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa"; // Asegúrate de tener react-icons instalado



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
    </div>
  );
};

export default Home;

