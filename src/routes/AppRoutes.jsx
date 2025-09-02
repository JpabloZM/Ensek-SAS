import { Routes, Route } from "react-router-dom";
import { AuthRoute } from "../components/AuthRoute.new";
import { PostLoginRedirect } from "../components/PostLoginRedirect";
import { ROUTE_CONFIG } from "../config/routeConfig";

// Importar componentes de páginas
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Welcome from "../pages/Welcome";
import Home from "../pages/Home";

// Componentes de Cliente
import ClientDashboard from "../client/pages/Dashboard";
import ClientServices from "../client/pages/Services";
import ClientProfile from "../client/pages/Profile";
import RequestService from "../client/pages/RequestService";

// Componentes de Admin
import AdminDashboard from "../admin/pages/Dashboard";
import AdminInventory from "../admin/pages/Inventory";
import AdminUsers from "../admin/pages/Users";
import AdminServices from "../admin/pages/Services";
import AdminReports from "../admin/pages/Reports";
import AdminTechnicians from "../admin/pages/Technicians";
import AdminProfile from "../admin/pages/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path={ROUTE_CONFIG.public.welcome} element={<Welcome />} />
      <Route path={ROUTE_CONFIG.public.login} element={<Login />} />
      <Route path={ROUTE_CONFIG.public.register} element={<Register />} />
      <Route path={ROUTE_CONFIG.public.home} element={<Home />} />

      {/* Rutas de Cliente */}
      <Route
        path={ROUTE_CONFIG.user.dashboard}
        element={<AuthRoute component={ClientDashboard} />}
      />
      <Route
        path={ROUTE_CONFIG.user.services}
        element={<AuthRoute component={ClientServices} />}
      />
      <Route
        path={ROUTE_CONFIG.user.profile}
        element={<AuthRoute component={ClientProfile} />}
      />
      <Route
        path={ROUTE_CONFIG.user.requestService}
        element={<AuthRoute component={RequestService} />}
      />

      {/* Rutas de Administrador */}
      <Route
        path={ROUTE_CONFIG.admin.dashboard}
        element={<AuthRoute component={AdminDashboard} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.inventory}
        element={<AuthRoute component={AdminInventory} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.users}
        element={<AuthRoute component={AdminUsers} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.services}
        element={<AuthRoute component={AdminServices} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.reports}
        element={<AuthRoute component={AdminReports} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.technicians}
        element={<AuthRoute component={AdminTechnicians} />}
      />
      <Route
        path={ROUTE_CONFIG.admin.profile}
        element={<AuthRoute component={AdminProfile} />}
      />

      {/* Redirección Post-Login */}
      <Route path="/redirect" element={<PostLoginRedirect />} />

      {/* Ruta 404 - Debe ir al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componente NotFound simple
const NotFound = () => (
  <div className="not-found">
    <h1>404 - Página no encontrada</h1>
    <p>Lo sentimos, la página que buscas no existe.</p>
  </div>
);

export default AppRoutes;
