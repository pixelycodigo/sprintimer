import { useState, useEffect } from 'react';
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
import GestionDiasLaborales from './pages/admin/proyectos/GestionDiasLaborales';

// Team Member - Tareas
import MisTareas from './pages/usuario/tareas/MisTareas';
import RegistrarTarea from './pages/usuario/tareas/RegistrarTarea';

// Team Member - Estadísticas
import EstadisticasUsuario from './pages/usuario/estadisticas/EstadisticasUsuario';

// Admin - Estadísticas
import EstadisticasAdmin from './pages/admin/estadisticas/EstadisticasAdmin';

// Admin - Cortes
import CortesMensuales from './pages/admin/cortes/CortesMensuales';
import DetalleCorte from './pages/admin/cortes/DetalleCorte';

// Admin - Sprints
import ListaSprints from './pages/admin/sprints/ListaSprints';
import CrearSprint from './pages/admin/sprints/CrearSprint';
import EditarSprint from './pages/admin/sprints/EditarSprint';

// Admin - Actividades
import ListaActividades from './pages/admin/actividades/ListaActividades';
import CrearActividad from './pages/admin/actividades/CrearActividad';
import EditarActividad from './pages/admin/actividades/EditarActividad';

// Admin - Hitos
import ListaHitos from './pages/admin/hitos/ListaHitos';
import CrearHito from './pages/admin/hitos/CrearHito';
import EditarHito from './pages/admin/hitos/EditarHito';

// Admin - Trimestres
import ListaTrimestres from './pages/admin/trimestres/ListaTrimestres';
import CrearTrimestre from './pages/admin/trimestres/CrearTrimestre';
import EditarTrimestre from './pages/admin/trimestres/EditarTrimestre';

// Admin - Bonos
import ListaBonos from './pages/admin/bonos/ListaBonos';

// Admin - Costos
import CostosPorHora from './pages/admin/costos/CostosPorHora';

// Admin - Monedas
import ListaMonedas from './pages/admin/monedas/ListaMonedas';
import CrearMoneda from './pages/admin/monedas/CrearMoneda';
import EditarMoneda from './pages/admin/monedas/EditarMoneda';

// Team Member - Cortes
import MisCortes from './pages/usuario/cortes/MisCortes';
import DetalleCorteTeamMember from './pages/admin/cortes/DetalleCorte';

// Admin - Roles (Perfiles)
import ListaRoles from './pages/admin/roles/ListaRoles';
import PerfilesEquipo from './pages/admin/perfiles/PerfilesEquipo';
import ListaUsuariosSuperAdmin from './pages/admin/usuarios/ListaUsuariosSuperAdmin';
import EditarUsuarioSuperAdmin from './pages/admin/usuarios/EditarUsuarioSuperAdmin';
import EliminadosSuperAdmin from './pages/admin/usuarios/EliminadosSuperAdmin';

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

// Dashboard Admin (rol: admin)
function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    proyectosActivos: 0,
    horasEsteMes: 0,
    cortesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'http://localhost:3500/api';

      const [usuariosRes, proyectosRes] = await Promise.all([
        fetch(`${API_URL}/admin/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json()),
        fetch(`${API_URL}/admin/proyectos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json()),
      ]);

      setStats({
        totalUsuarios: usuariosRes.usuarios?.length || 0,
        proyectosActivos: proyectosRes.proyectos?.filter(p => p.estado === 'activo').length || 0,
        horasEsteMes: Math.floor(Math.random() * 100) + 50,
        cortesPendientes: Math.floor(Math.random() * 5),
      });
    } catch (error) {
      console.error('Error al cargar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de Administrador - Gestión de proyectos y clientes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mis Usuarios', value: loading ? '...' : stats.totalUsuarios, icon: '👥', color: 'bg-blue-50 text-blue-600' },
          { label: 'Proyectos Activos', value: loading ? '...' : stats.proyectosActivos, icon: '📦', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Horas este Mes', value: loading ? '...' : `${stats.horasEsteMes}h`, icon: '⏱️', color: 'bg-amber-50 text-amber-600' },
          { label: 'Cortes Pendientes', value: loading ? '...' : stats.cortesPendientes, icon: '💰', color: 'bg-purple-50 text-purple-600' },
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
          Como Administrador, puedes gestionar clientes, proyectos, sprints, actividades
          y ver estadísticas de tu área.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/admin/clientes" className="btn-primary">
            Gestionar Clientes
          </a>
          <a href="/admin/proyectos" className="btn-secondary">
            Ver Proyectos
          </a>
        </div>
      </div>
    </div>
  );
}

// Dashboard Team Member (rol: team_member)
function TeamMemberDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de Team Member - Registro de tareas y tiempo
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
          <a href="/team-member/tareas" className="btn-primary">
            Registrar Tarea
          </a>
          <a href="/team-member/cortes" className="btn-secondary">
            Ver Cortes
          </a>
        </div>
      </div>
    </div>
  );
}

// Dashboard Super Admin (rol: super_admin)
function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalTeamMembers: 0,
    totalProyectos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'http://localhost:3500/api';

      const [usuariosRes, proyectosRes] = await Promise.all([
        fetch(`${API_URL}/admin/usuarios/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json()),
        fetch(`${API_URL}/admin/proyectos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json()),
      ]);

      // Contar admins y team members
      const admins = usuariosRes.usuarios?.filter(u => u.rol === 'admin') || [];
      const teamMembers = usuariosRes.usuarios?.filter(u => u.rol === 'team_member') || [];

      setStats({
        totalAdmins: admins.length,
        totalTeamMembers: teamMembers.length,
        totalProyectos: proyectosRes.proyectos?.length || 0,
      });
    } catch (error) {
      console.error('Error al cargar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Panel de Super Administrador - Gestión de la Plataforma SaaS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Admins', value: loading ? '...' : stats.totalAdmins, icon: '👨‍💼', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Team Members', value: loading ? '...' : stats.totalTeamMembers, icon: '👥', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Proyectos Totales', value: loading ? '...' : stats.totalProyectos, icon: '📦', color: 'bg-amber-50 text-amber-600' },
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
          Como Super Administrador, gestionas la plataforma SaaS. Puedes crear administradores,
          ver estadísticas globales y actuar como moderador en las cuentas de los admins.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/super-admin/usuarios" className="btn-primary">
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

          {/* Rutas Protegidas - Super Admin (rol: super_admin) */}
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
            <Route path="usuarios" element={<ListaUsuariosSuperAdmin />} />
            <Route path="usuarios/crear" element={<CrearUsuario />} />
            <Route path="usuarios/:id" element={<DetalleUsuario />} />
            <Route path="usuarios/:id/editar" element={<EditarUsuarioSuperAdmin />} />
            <Route path="usuarios/:id/cambiar-password" element={<CambiarPasswordUsuario />} />
            <Route path="estadisticas" element={<EstadisticasAdmin />} />
            <Route path="eliminados" element={<EliminadosSuperAdmin />} />
          </Route>

          {/* Rutas Protegidas - Admin (rol: admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="perfil" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="roles" element={<ListaRoles />} />
            <Route path="perfiles" element={<PerfilesEquipo />} />
            <Route path="team" element={<ListaUsuarios />} />
            <Route path="team/crear" element={<CrearUsuario />} />
            <Route path="team/:id" element={<DetalleUsuario />} />
            <Route path="team/:id/editar" element={<EditarUsuario />} />
            <Route path="team/:id/cambiar-password" element={<CambiarPasswordUsuario />} />
            <Route path="eliminados" element={<Eliminados />} />
            <Route path="clientes" element={<ListaClientes />} />
            <Route path="clientes/crear" element={<CrearCliente />} />
            <Route path="clientes/:id" element={<EditarCliente />} />
            <Route path="clientes/:id/editar" element={<EditarCliente />} />
            <Route path="proyectos" element={<ListaProyectos />} />
            <Route path="proyectos/crear" element={<CrearProyecto />} />
            <Route path="proyectos/:id" element={<DetalleUsuario />} />
            <Route path="proyectos/:id/editar" element={<EditarProyecto />} />
            <Route path="proyectos/:id/asignar-usuarios" element={<AsignarUsuariosProyecto />} />
            <Route path="proyectos/:id/dias-laborables" element={<ConfigurarDiasLaborables />} />
            <Route path="dias-laborales" element={<GestionDiasLaborales />} />
            <Route path="estadisticas" element={<EstadisticasAdmin />} />
            <Route path="cortes" element={<CortesMensuales />} />
            <Route path="cortes/:id" element={<DetalleCorte />} />
            <Route path="sprints" element={<ListaSprints />} />
            <Route path="sprints/crear" element={<CrearSprint />} />
            <Route path="sprints/:id/editar" element={<EditarSprint />} />
            <Route path="actividades" element={<ListaActividades />} />
            <Route path="actividades/crear" element={<CrearActividad />} />
            <Route path="actividades/:id/editar" element={<EditarActividad />} />
            <Route path="hitos" element={<ListaHitos />} />
            <Route path="hitos/crear" element={<CrearHito />} />
            <Route path="hitos/:id/editar" element={<EditarHito />} />
            <Route path="trimestres" element={<ListaTrimestres />} />
            <Route path="trimestres/crear" element={<CrearTrimestre />} />
            <Route path="trimestres/:id/editar" element={<EditarTrimestre />} />
            <Route path="bonos" element={<ListaBonos />} />
            <Route path="costos" element={<CostosPorHora />} />
            <Route path="monedas" element={<ListaMonedas />} />
            <Route path="monedas/crear" element={<CrearMoneda />} />
            <Route path="monedas/:id/editar" element={<EditarMoneda />} />
          </Route>

          {/* Rutas Protegidas - Team Member (rol: team_member) */}
          <Route
            path="/team-member"
            element={
              <ProtectedRoute allowedRoles={['team_member']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/team-member/dashboard" replace />} />
            <Route path="dashboard" element={<TeamMemberDashboard />} />
            <Route path="tareas" element={<MisTareas />} />
            <Route path="tareas/registrar" element={<RegistrarTarea />} />
            <Route path="estadisticas" element={<EstadisticasUsuario />} />
            <Route path="cortes" element={<MisCortes />} />
            <Route path="cortes/:id" element={<DetalleCorteTeamMember />} />
          </Route>

          {/* Redirect raíz */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Unauthorized - Redirigir a login */}
          <Route path="/unauthorized" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl text-slate-400">404 - Página no encontrada</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
