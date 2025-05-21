import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Importaciones de componentes
import ClientLayout from "./client/components/layout/ClientLayout";
import AdminLayout from "./admin/components/layout/AdminLayout";
import Home from "./client/pages/Home";
import Services from "./client/pages/Services";
import FormServices from "./client/pages/FormServices";
import AdminLogin from "./admin/auth/Login";
import ClientLogin from "./client/auth/ClientLogin";
import Register from "./admin/auth/Register";
import Dashboard from "./admin/pages/Dashboard";
import Schedule from "./admin/pages/Schedule";
import Inventory from "./admin/pages/Inventory";
import ProtectedRoute from "./admin/auth/ProtectedRoute";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Rutas del cliente */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="servicios" element={<Services />} />
            <Route path="servicios/formulario" element={<FormServices />} />
            <Route path="login" element={<ClientLogin />} />
          </Route>

          {/* Rutas del admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route path="registro" element={<Register />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="calendario"
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventario"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
