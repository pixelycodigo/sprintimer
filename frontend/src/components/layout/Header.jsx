import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      {/* Breadcrumb / Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Bienvenido de nuevo, {user?.nombre?.split(' ')[0]}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <Link
          to={`/${user?.rol === 'usuario' ? 'usuario' : 'admin'}/perfil`}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="text-xl">⚙️</span>
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-900">{user?.nombre}</p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.rol?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
