import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./hooks/useAuth";

// Importaciones de componentes
import ClientLayout from "./client/components/layout/ClientLayout";
import AdminLayout from "./admin/components/layout/AdminLayout";
import WelcomeLayout from "./client/components/layout/WelcomeLayout";
import Home from "./client/pages/Home";
import Services from "./client/pages/Services";
import FormServices from "./client/pages/FormServices";
import AdminLogin from "./admin/auth/Login";
import AdminRegister from "./admin/auth/Register";
import ClientLogin from "./client/auth/ClientLogin";
import Register from "./client/auth/Register";
import Dashboard from "./admin/pages/Dashboard";
import Schedule from "./admin/pages/Schedule";
import Inventory from "./admin/pages/Inventory";
import AuthRoute from "./components/AuthRoute";
import AuthDebug from "./components/AuthDebug";
import AuthDebugPage from "./components/AuthDebugPage";

// Root level redirect based on authentication status
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  // Redirect based on user authentication and role
  if (user) {
    return user.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/cliente" replace />;
  }
  
  // Not authenticated, show welcome page
  return <Navigate to="/welcome" replace />;
};

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Root path redirects based on auth status */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Welcome pages - for non-authenticated users */}
          <Route path="/welcome" element={
            <AuthRoute requiredAuth={false} redirectTo="/">
              <WelcomeLayout />
            </AuthRoute>
          }>
            <Route index element={<Home />} />
            <Route path="servicios" element={<Services />} />
          </Route>
          
          {/* Auth pages */}
          <Route path="/login" element={
            <AuthRoute requiredAuth={false} redirectTo="/">
              <ClientLogin />
            </AuthRoute>
          } />
          <Route path="/registro" element={
            <AuthRoute requiredAuth={false} redirectTo="/">
              <Register />
            </AuthRoute>
          } />
          
          {/* Client routes - for authenticated users */}
          <Route path="/cliente" element={
            <AuthRoute requiredAuth={true} allowedRoles={['user', 'admin']} redirectTo="/login">
              <ClientLayout />
            </AuthRoute>
          }>
            <Route index element={<Home />} />
            <Route path="servicios" element={<Services />} />
            <Route path="servicios/formulario" element={<FormServices />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={
              <AuthRoute requiredAuth={false} redirectTo="/admin/dashboard">
                <AdminLogin />
              </AuthRoute>
            } />
            <Route path="registro" element={
              <AuthRoute requiredAuth={false} redirectTo="/admin/dashboard">
                <AdminRegister />
              </AuthRoute>
            } />
            <Route path="dashboard" element={
              <AuthRoute requiredAuth={true} allowedRoles={['admin']} redirectTo="/admin/login">
                <Dashboard />
              </AuthRoute>
            } />
            <Route path="calendario" element={
              <AuthRoute requiredAuth={true} allowedRoles={['admin']} redirectTo="/admin/login">
                <Schedule />
              </AuthRoute>
            } />
            <Route path="inventario" element={
              <AuthRoute requiredAuth={true} allowedRoles={['admin']} redirectTo="/admin/login">
                <Inventory />
              </AuthRoute>
            } />          </Route>

        </Routes>
        
       
      </Router>
    </div>
  );
}

export default App;
