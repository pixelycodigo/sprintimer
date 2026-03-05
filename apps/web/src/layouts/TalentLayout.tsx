import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
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
  { name: 'Dashboard', href: '/talent', icon: LayoutDashboard },
  { name: 'Mis Proyectos', href: '/talent/proyectos', icon: Briefcase },
  { name: 'Mis Tareas', href: '/talent/tareas', icon: CheckSquare },
];

export default function TalentLayout() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          sidebar.isOpen ? 'w-64' : 'w-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center justify-between h-16 px-4 border-b border-gray-200',
          !sidebar.isOpen && 'hidden'
        )}>
          <h1 className="text-xl font-bold text-blue-600">SPRINTASK</h1>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto py-4', !sidebar.isOpen && 'hidden')}>
          <div className="px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className={cn('p-4 border-t border-gray-200', !sidebar.isOpen && 'hidden')}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', sidebar.isOpen ? 'ml-64' : 'ml-0')}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={sidebar.toggle}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sidebar.isOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center space-x-4">
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-medium">
                    {getInitial(user?.nombre_completo || 'U')}
                  </div>
                  <div className="text-sm text-left hidden sm:block">
                    <p className="font-medium text-gray-700">{user?.nombre_completo}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    <Link
                      to="/talent/perfil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Ver perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
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
