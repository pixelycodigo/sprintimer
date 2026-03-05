import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useSidebarStore } from '../stores/sidebar.store';
import { useAuthStore } from '../stores/auth.store';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/super-admin/usuarios', icon: Users },
];

export default function SuperAdminLayout() {
  const sidebar = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
          sidebar.isOpen ? 'w-64' : 'w-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center justify-between h-16 px-4 border-b border-slate-200',
          !sidebar.isOpen && 'hidden'
        )}>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">SPRINTASK</h1>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto py-4', !sidebar.isOpen && 'hidden')}>
          <div className="px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3 text-slate-400" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className={cn('p-4 border-t border-slate-200', !sidebar.isOpen && 'hidden')}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', sidebar.isOpen ? 'ml-64' : 'ml-0')}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={sidebar.toggle}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              aria-label={sidebar.isOpen ? 'Contraer menú' : 'Expandir menú'}
            >
              {sidebar.isOpen ? (
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            <div className="flex items-center space-x-4">
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                  aria-label="Abrir menú de usuario"
                  aria-expanded={showUserMenu}
                >
                  <div 
                    className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm"
                    aria-hidden="true"
                  >
                    {getInitial(user?.nombre_completo || 'U')}
                  </div>
                  <div className="text-sm text-left hidden sm:block">
                    <p className="font-medium text-slate-900">{user?.nombre_completo}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.rol}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div 
                    className="dropdown-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/super-admin/perfil"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      Ver perfil
                    </Link>
                    <Link
                      to="/super-admin/configuracion"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                      Configuración
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
