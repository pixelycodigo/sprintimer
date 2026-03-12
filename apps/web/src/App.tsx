import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { getBasePath } from './utils/getBasePath';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TalentLayout from './layouts/TalentLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import ClienteLayout from './layouts/ClienteLayout';

// Páginas de Autenticación (Features)
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';

// Features de Admin
import { AdminDashboard, ClienteDashboard, TalentDashboard, SuperAdminDashboard } from './features/dashboard';
import { ClientesList, ClientesCrear, ClientesEditar } from './features/clientes';
import { TalentsList, TalentsCrear, TalentsEditar } from './features/talents';
import { ActividadesList, ActividadesCrear, ActividadesEditar } from './features/actividades';
import { ProyectosList, ProyectosCrear, ProyectosEditar } from './features/proyectos';
import { PerfilesList, PerfilesCrear, PerfilesEditar } from './features/perfiles';
import { SenioritiesList, SenioritiesCrear, SenioritiesEditar } from './features/seniorities';
import { DivisasList, DivisasCrear, DivisasEditar } from './features/divisas';
import { CostoPorHoraList, CostoPorHoraCrear, CostoPorHoraEditar } from './features/costo-por-hora';
import { AsignacionesList, AsignacionesCrear, AsignacionesEditar } from './features/asignaciones';
import { EliminadosList } from './features/eliminados';

// Features de Super Admin
import { UsuariosList, UsuariosCrear, UsuariosEditar } from './features/super-admin';

// Features de Admin
import { AdminPerfil, AdminConfiguracion } from './features/admin';

// Páginas de Talent
import { TalentProyectos, TalentTareas, TareasCrear, TareasEditar, TareasEliminadas, TalentActividades } from './features/talent';

// Páginas de Cliente
import { ClienteProyectos, ClienteActividades } from './features/cliente';

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Construir ruta de login dinámica
    const basePath = getBasePath();
    const loginPath = basePath ? `${basePath}/login` : '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    // Construir ruta de unauthorized dinámica
    const basePath = getBasePath();
    const unauthorizedPath = basePath ? `${basePath}/unauthorized` : '/unauthorized';
    return <Navigate to={unauthorizedPath} replace />;
  }

  return children;
};

function App() {
  const basePath = getBasePath();
  const loginPath = basePath ? `${basePath}/login` : '/login';

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar-password" element={<ForgotPasswordPage />} />

      {/* Rutas Super Admin */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="usuarios" element={<UsuariosList />} />
        <Route path="usuarios/crear" element={<UsuariosCrear />} />
        <Route path="usuarios/:id" element={<UsuariosEditar />} />
      </Route>

      {/* Rutas Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="clientes" element={<ClientesList />} />
        <Route path="clientes/crear" element={<ClientesCrear />} />
        <Route path="clientes/:id" element={<ClientesEditar />} />
        <Route path="talents" element={<TalentsList />} />
        <Route path="talents/crear" element={<TalentsCrear />} />
        <Route path="talents/:id" element={<TalentsEditar />} />
        <Route path="actividades" element={<ActividadesList />} />
        <Route path="actividades/crear" element={<ActividadesCrear />} />
        <Route path="actividades/:id" element={<ActividadesEditar />} />
        <Route path="proyectos" element={<ProyectosList />} />
        <Route path="proyectos/crear" element={<ProyectosCrear />} />
        <Route path="proyectos/:id" element={<ProyectosEditar />} />
        <Route path="perfiles" element={<PerfilesList />} />
        <Route path="perfiles/crear" element={<PerfilesCrear />} />
        <Route path="perfiles/:id" element={<PerfilesEditar />} />
        <Route path="seniorities" element={<SenioritiesList />} />
        <Route path="seniorities/crear" element={<SenioritiesCrear />} />
        <Route path="seniorities/:id" element={<SenioritiesEditar />} />
        <Route path="divisas" element={<DivisasList />} />
        <Route path="divisas/crear" element={<DivisasCrear />} />
        <Route path="divisas/:id" element={<DivisasEditar />} />
        <Route path="costo-por-hora" element={<CostoPorHoraList />} />
        <Route path="costo-por-hora/crear" element={<CostoPorHoraCrear />} />
        <Route path="costo-por-hora/:id" element={<CostoPorHoraEditar />} />
        <Route path="asignaciones" element={<AsignacionesList />} />
        <Route path="asignaciones/crear" element={<AsignacionesCrear />} />
        <Route path="asignaciones/:id" element={<AsignacionesEditar />} />
        <Route path="eliminados" element={<EliminadosList />} />
        <Route path="perfil" element={<AdminPerfil />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>

      {/* Rutas Talent */}
      <Route
        path="/talent"
        element={
          <ProtectedRoute allowedRoles={['talent']}>
            <TalentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TalentDashboard />} />
        <Route path="proyectos" element={<TalentProyectos />} />
        <Route path="actividades" element={<TalentActividades />} />
        <Route path="tareas" element={<TalentTareas />} />
        <Route path="tareas/crear" element={<TareasCrear />} />
        <Route path="tareas/:id/editar" element={<TareasEditar />} />
        <Route path="tareas/eliminadas" element={<TareasEliminadas />} />
      </Route>

      {/* Rutas Cliente */}
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <ClienteLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClienteDashboard />} />
        <Route path="proyectos" element={<ClienteProyectos />} />
        <Route path="actividades" element={<ClienteActividades />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to={loginPath} replace />} />
      <Route path="*" element={<Navigate to={loginPath} replace />} />
    </Routes>
  );
}

export default App;
