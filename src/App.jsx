import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Calendar from "./components/Calendar/Calendar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="d-flex align-items-center">
            <Link to="/" className="navbar-brand">
              <i className="fas fa-calendar-alt me-2"></i>
              ENSEK
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                <i className="fas fa-calendar-alt"></i>
                <span>Calendario</span>
              </Link>
              <Link to="/inventario" className="nav-link">
                <i className="fas fa-box"></i>
                <span>Inventario</span>
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
