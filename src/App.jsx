import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importaciones de componentes
import ClientLayout from "./client/components/layout/ClientLayout";
import AdminLayout from "./admin/components/layout/AdminLayout";
import Home from "./client/pages/Home";
import Services from "./client/pages/Services";
import FormServices from "./client/pages/FormServices";
import TestConnection from "./components/TestConnection";
import Login from "./admin/auth/Login";
import Register from "./admin/auth/Register";
import Dashboard from "./admin/pages/Dashboard";
import Schedule from "./admin/pages/Schedule";
import Inventory from "./admin/pages/Inventory";
import ProtectedRoute from "./admin/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de prueba */}
        <Route path="test-connection" element={<TestConnection />} />

        {/* Rutas del cliente */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="servicios" element={<Services />} />
          <Route path="servicios/formulario" element={<FormServices />} />
        </Route>

        {/* Rutas del admin */}
        <Route path="admin" element={<AdminLayout />}>
          <Route path="login" element={<Login />} />
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
  );
}

export default App;
