import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Páginas de Autenticación
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';

// Admin - Usuarios
import ListaUsuarios from './pages/admin/usuarios/ListaUsuarios';
import CrearUsuario from './pages/admin/usuarios/CrearUsuario';
import EditarUsuario from './pages/admin/usuarios/EditarUsuario';
import DetalleUsuario from './pages/admin/usuarios/DetalleUsuario';
import Eliminados from './pages/admin/usuarios/Eliminados';
import CambiarPasswordUsuario from './pages/admin/usuarios/CambiarPasswordUsuario';

// Admin - Clientes
import ListaClientes from './pages/admin/clientes/ListaClientes';
import CrearCliente from './pages/admin/clientes/CrearCliente';
import EditarCliente from './pages/admin/clientes/EditarCliente';

// Admin - Proyectos
import ListaProyectos from './pages/admin/proyectos/ListaProyectos';
import CrearProyecto from './pages/admin/proyectos/CrearProyecto';
import EditarProyecto from './pages/admin/proyectos/EditarProyecto';
import AsignarUsuariosProyecto from './pages/admin/proyectos/AsignarUsuariosProyecto';
import ConfigurarDiasLaborables from './pages/admin/proyectos/ConfigurarDiasLaborables';

// Usuario - Tareas
import MisTareas from './pages/usuario/tareas/MisTareas';
import RegistrarTarea from './pages/usuario/tareas/RegistrarTarea';

// Usuario - Estadísticas
import EstadisticasUsuario from './pages/usuario/estadisticas/EstadisticasUsuario';

// Admin - Estadísticas
import EstadisticasAdmin from './pages/admin/estadisticas/EstadisticasAdmin';

// Admin - Cortes
import CortesMensuales from './pages/admin/cortes/CortesMensuales';
import DetalleCorte from './pages/admin/cortes/DetalleCorte';

// Usuario - Cortes
import MisCortes from './pages/usuario/cortes/MisCortes';
import DetalleCorteUsuario from './pages/admin/cortes/DetalleCorte';

// Componente de Ruta Protegida
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Dashboard Admin Placeholder
function AdminDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de administración de SprinTimer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Usuarios', value: '0', icon: '👥', color: 'bg-blue-50 text-blue-600' },
          { label: 'Proyectos Activos', value: '0', icon: '📦', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Horas este Mes', value: '0h', icon: '⏱️', color: 'bg-amber-50 text-amber-600' },
          { label: 'Cortes Pendientes', value: '0', icon: '💰', color: 'bg-purple-50 text-purple-600' },
        ].map((stat, index) => (
          <div key={index} className="card-base p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 data-number mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          ¡Bienvenido, {user?.nombre?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-600">
          Este es tu panel de administración. Aquí podrás gestionar usuarios, clientes, proyectos, 
          sprints, actividades, cortes mensuales y ver estadísticas detalladas.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/admin/usuarios" className="btn-primary">
            Gestionar Usuarios
          </a>
          <a href="/admin/proyectos" className="btn-secondary">
            Ver Proyectos
          </a>
        </div>
      </div>
    </div>
  );
}

// Dashboard Usuario Placeholder
function UsuarioDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de usuario de SprinTimer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Proyectos Asignados', value: '0', icon: '📦', color: 'bg-blue-50 text-blue-600' },
          { label: 'Horas este Mes', value: '0h', icon: '⏱️', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Tareas Completadas', value: '0', icon: '✅', color: 'bg-amber-50 text-amber-600' },
          { label: 'Cortes Pagados', value: '0', icon: '💰', color: 'bg-purple-50 text-purple-600' },
        ].map((stat, index) => (
          <div key={index} className="card-base p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 data-number mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          ¡Hola, {user?.nombre?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-600">
          Desde este panel puedes registrar tus tareas, ver tus horas trabajadas, 
          consultar tus cortes mensuales y ver tu progreso en las actividades asignadas.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/usuario/tareas" className="btn-primary">
            Registrar Tarea
          </a>
          <a href="/usuario/proyectos" className="btn-secondary">
            Ver Proyectos
          </a>
        </div>
      </div>
    </div>
  );
}

// Dashboard Super Admin Placeholder
function SuperAdminDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de Super Administrador
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Admins', value: '0', icon: '👨‍💼', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Usuarios', value: '0', icon: '👥', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Proyectos Totales', value: '0', icon: '📦', color: 'bg-amber-50 text-amber-600' },
          { label: 'Ingreso Mensual', value: '$0', icon: '💰', color: 'bg-purple-50 text-purple-600' },
        ].map((stat, index) => (
          <div key={index} className="card-base p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 data-number mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          ¡Bienvenido, {user?.nombre?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-600">
          Como Super Administrador, tienes acceso completo al sistema. Puedes gestionar 
          administradores, ver todos los proyectos y usuarios, y acceder a estadísticas globales.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/super-admin/admins" className="btn-primary">
            Gestionar Admins
          </a>
          <a href="/super-admin/estadisticas" className="btn-secondary">
            Ver Estadísticas
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas Protegidas - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="usuarios" element={<ListaUsuarios />} />
            <Route path="usuarios/crear" element={<CrearUsuario />} />
            <Route path="usuarios/:id" element={<DetalleUsuario />} />
            <Route path="usuarios/:id/editar" element={<EditarUsuario />} />
            <Route path="usuarios/:id/cambiar-password" element={<CambiarPasswordUsuario />} />
            <Route path="eliminados" element={<Eliminados />} />
            <Route path="clientes" element={<ListaClientes />} />
            <Route path="clientes/crear" element={<CrearCliente />} />
            <Route path="clientes/:id" element={<DetalleUsuario />} />
            <Route path="clientes/:id/editar" element={<EditarCliente />} />
            <Route path="proyectos" element={<ListaProyectos />} />
            <Route path="proyectos/crear" element={<CrearProyecto />} />
            <Route path="proyectos/:id" element={<DetalleUsuario />} />
            <Route path="proyectos/:id/editar" element={<EditarProyecto />} />
            <Route path="proyectos/:id/asignar-usuarios" element={<AsignarUsuariosProyecto />} />
            <Route path="proyectos/:id/dias-laborables" element={<ConfigurarDiasLaborables />} />
            <Route path="estadisticas" element={<EstadisticasAdmin />} />
            <Route path="cortes" element={<CortesMensuales />} />
            <Route path="cortes/:id" element={<DetalleCorte />} />
          </Route>

          {/* Rutas Protegidas - Usuario */}
          <Route
            path="/usuario"
            element={
              <ProtectedRoute allowedRoles={['usuario', 'admin', 'super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="dashboard" element={<UsuarioDashboard />} />
            <Route path="tareas" element={<MisTareas />} />
            <Route path="tareas/registrar" element={<RegistrarTarea />} />
            <Route path="estadisticas" element={<EstadisticasUsuario />} />
            <Route path="cortes" element={<MisCortes />} />
            <Route path="cortes/:id" element={<DetalleCorteUsuario />} />
          </Route>

          {/* Rutas Protegidas - Super Admin */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
          </Route>

          {/* Redirect raíz */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl text-slate-400">404 - Página no encontrada</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
