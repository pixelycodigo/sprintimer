import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = {
  // Super Admin
  super_admin: [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: '📊' },
    { name: 'Usuarios', path: '/super-admin/usuarios', icon: '👨‍💼' },
    { name: 'Estadísticas', path: '/super-admin/estadisticas', icon: '📈' },
    { name: 'Eliminados', path: '/super-admin/eliminados', icon: '🗑️' },
  ],
  // Admin
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Clientes', path: '/admin/clientes', icon: '🏢' },
    {
      name: 'Proyectos',
      icon: '📦',
      subItems: [
        { name: 'Lista de Proyectos', path: '/admin/proyectos' },
        { name: 'Actividades', path: '/admin/actividades' },
        { name: 'Hitos', path: '/admin/hitos' },
        { name: 'Sprints', path: '/admin/sprints' },
        { name: 'Trimestres', path: '/admin/trimestres' },
      ]
    },
    {
      name: 'Equipo',
      icon: '👥',
      subItems: [
        { name: 'Mi Equipo', path: '/admin/team' },
        { name: 'Perfiles', path: '/admin/perfiles' },
        { name: 'Seniorities', path: '/admin/seniorities' },
      ]
    },
    {
      name: 'Configuración',
      icon: '⚙️',
      subItems: [
        { name: 'Monedas', path: '/admin/monedas' },
        { name: 'Bonos', path: '/admin/bonos' },
        { name: 'Costo por Hora', path: '/admin/costoHora' },
        { name: 'Días Laborales', path: '/admin/dias-laborales' },
      ]
    },
    { name: 'Estadísticas', path: '/admin/estadisticas', icon: '📈' },
    { name: 'Cortes Mensuales', path: '/admin/cortes', icon: '💰' },
    { name: 'Eliminados', path: '/admin/eliminados', icon: '🗑️' },
  ],
  // Team Member
  team_member: [
    { name: 'Dashboard', path: '/team-member/dashboard', icon: '📊' },
    { name: 'Mis Tareas', path: '/team-member/tareas', icon: '✅' },
    { name: 'Mis Cortes', path: '/team-member/cortes', icon: '💰' },
    { name: 'Estadísticas', path: '/team-member/estadisticas', icon: '📈' },
  ],
};

// Componente para items de menú con submenú
function MenuItem({ item, activePath }) {
  const location = useLocation();

  // Verificar si algún subitem está activo
  const isSubItemActive = item.subItems?.some(sub => location.pathname === sub.path);
  const isActive = location.pathname === item.path;

  // El menú padre debe estar expandido si un subitem está activo
  const shouldExpand = isSubItemActive || activePath === item.name;

  if (item.subItems) {
    return (
      <li>
        <details open={shouldExpand} className="group">
          <summary
            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer list-none ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </div>
            <span className="text-slate-400 transition-transform group-open:rotate-45">
              {isSubItemActive ? '−' : '+'}
            </span>
          </summary>
          <ul className="ml-8 mt-1 space-y-1">
            {item.subItems.map((subItem) => {
              const isSubActive = location.pathname === subItem.path;
              return (
                <li key={subItem.path}>
                  <Link
                    to={subItem.path}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSubActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {subItem.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </li>
    );
  }

  // Item normal sin submenú
  return (
    <li>
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
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activePath, setActivePath] = useState('');

  // Obtener menú según rol
  const currentMenu = menuItems[user?.rol] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determinar qué menú debe estar expandido basado en la ruta actual
  useEffect(() => {
    for (const item of currentMenu) {
      if (item.subItems?.some(sub => location.pathname === sub.path)) {
        setActivePath(item.name);
        return;
      }
    }
    setActivePath('');
  }, [location.pathname, user?.rol]);

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <span className="font-bold text-lg text-gradient">SprinTask</span>
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
          {currentMenu.map((item, index) => (
            <MenuItem key={index} item={item} activePath={activePath} />
          ))}
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
