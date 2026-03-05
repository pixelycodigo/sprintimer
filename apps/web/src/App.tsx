import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import TalentLayout from './layouts/TalentLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Páginas de Autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas de Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminClientes from './pages/admin/Clientes';
import AdminTalents from './pages/admin/Talents';
import AdminActividades from './pages/admin/Actividades';
import AdminProyectos from './pages/admin/Proyectos';
import AdminPerfiles from './pages/admin/Perfiles';
import AdminSeniorities from './pages/admin/Seniorities';
import AdminDivisas from './pages/admin/Divisas';
import AdminCostoPorHora from './pages/admin/CostoPorHora';
import AdminEliminados from './pages/admin/Eliminados';
import AdminAsignaciones from './pages/admin/Asignaciones';

// Páginas de Super Admin
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminUsuarios from './pages/super-admin/Usuarios';
import SuperAdminUsuariosCrear from './pages/super-admin/UsuariosCrear';

// Páginas de Talent
import TalentDashboard from './pages/talent/Dashboard';

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

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
        <Route path="usuarios" element={<SuperAdminUsuarios />} />
        <Route path="usuarios/crear" element={<SuperAdminUsuariosCrear />} />
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
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="talents" element={<AdminTalents />} />
        <Route path="actividades" element={<AdminActividades />} />
        <Route path="proyectos" element={<AdminProyectos />} />
        <Route path="perfiles" element={<AdminPerfiles />} />
        <Route path="seniorities" element={<AdminSeniorities />} />
        <Route path="divisas" element={<AdminDivisas />} />
        <Route path="costo-por-hora" element={<AdminCostoPorHora />} />
        <Route path="eliminados" element={<AdminEliminados />} />
        <Route path="asignaciones" element={<AdminAsignaciones />} />
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
      </Route>

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
