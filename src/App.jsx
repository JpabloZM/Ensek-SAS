import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { useAuth } from "./hooks/useAuth";

// Importaciones de componentes
import WelcomeLayout from "./client/components/layout/WelcomeLayout";
import Home from "./client/pages/Home";
import Services from "./client/pages/Services";
import FormServices from "./client/pages/FormServices";
import Register from "./client/auth/Register";
// import Dashboard from "./admin/pages/Dashboard";
import Schedule from "./admin/pages/Schedule";
import Inventory from "./admin/pages/Inventory";
import AuthRoute from "./components/AuthRoute";
import UnifiedLogin from "./components/UnifiedLogin";
import AdminLayout from "./admin/components/layout/AdminLayout";
import ClientLayout from "./client/components/layout/ClientLayout";

// Main route handler for "/"
function MainRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) {
    // Not authenticated: redirect to /welcome so nested routes render Home in Outlet
    return <Navigate to="/welcome" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin/calendario" replace />;
  }
  return <Navigate to="/app" replace />;
}

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Unified "/" route for all roles */}
          <Route path="/" element={<MainRoute />} />
          {/* Welcome section for unauthenticated users */}
          <Route element={<AuthRoute requiredAuth={false} redirectTo="/" />}>
            <Route path="welcome" element={<WelcomeLayout />}>
              <Route index element={<Home />} />
            </Route>
          </Route>{" "}
          {/* Client dashboard and pages */}
          <Route path="/app" element={<ClientLayout />}>
            {/* Home and dashboard require authentication */}
            <Route
              index
              element={
                <AuthRoute
                  requiredAuth={true}
                  allowedRoles={["user"]}
                  redirectTo="/login"
                >
                  <Home />
                </AuthRoute>
              }
            />
            {/* Services page is accessible to all users */}
            <Route path="servicios" element={<Services />} />
            {/* Service form requires authentication */}
            <Route
              path="servicios/formulario"
              element={
                <AuthRoute
                  requiredAuth={true}
                  allowedRoles={["user"]}
                  redirectTo="/login"
                >
                  <FormServices />
                </AuthRoute>
              }
            />
          </Route>
          {/* Admin dashboard and pages */}
          <Route
            path="/admin"
            element={
              <AuthRoute
                requiredAuth={true}
                allowedRoles={["admin"]}
                redirectTo="/login"
              >
                <AdminLayout />
              </AuthRoute>
            }
          >
            {/* <Route index element={<Dashboard />} /> */}
            <Route path="calendario" element={<Schedule />} />
            <Route path="inventario" element={<Inventory />} />
          </Route>{" "}
          {/* Auth pages */}
          <Route
            path="/login"
            element={
              <AuthRoute requiredAuth={false} redirectTo="/">
                <UnifiedLogin />
              </AuthRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <AuthRoute requiredAuth={false} redirectTo="/">
                <Register />
              </AuthRoute>
            }
          />
          {/* Fallback: redirect unknown routes to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
