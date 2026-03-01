import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Usuarios', path: '/admin/usuarios', icon: '👥' },
    { name: 'Clientes', path: '/admin/clientes', icon: '🏢' },
    { name: 'Proyectos', path: '/admin/proyectos', icon: '📦' },
    { name: 'Sprints', path: '/admin/sprints', icon: '📅' },
    { name: 'Actividades', path: '/admin/actividades', icon: '✅' },
    { name: 'Cortes', path: '/admin/cortes', icon: '💰' },
    { name: 'Estadísticas', path: '/admin/estadisticas', icon: '📈' },
    { name: 'Eliminados', path: '/admin/eliminados', icon: '🗑️' },
  ],
  usuario: [
    { name: 'Dashboard', path: '/usuario/dashboard', icon: '📊' },
    { name: 'Mis Proyectos', path: '/usuario/proyectos', icon: '📦' },
    { name: 'Mis Tareas', path: '/usuario/tareas', icon: '✅' },
    { name: 'Mis Horas', path: '/usuario/horas', icon: '⏱️' },
    { name: 'Mis Cortes', path: '/usuario/cortes', icon: '💰' },
    { name: 'Estadísticas', path: '/usuario/estadisticas', icon: '📈' },
  ],
  'super_admin': [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: '📊' },
    { name: 'Administradores', path: '/super-admin/admins', icon: '👨‍💼' },
    { name: 'Usuarios', path: '/super-admin/usuarios', icon: '👥' },
    { name: 'Proyectos', path: '/super-admin/proyectos', icon: '📦' },
    { name: 'Estadísticas', path: '/super-admin/estadisticas', icon: '📈' },
    { name: 'Eliminados', path: '/super-admin/eliminados', icon: '🗑️' },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentMenu = menuItems[user?.rol] || menuItems.usuario;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <span className="font-bold text-lg text-gradient">SprinTimer</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.nombre}
            </p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user?.rol?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
