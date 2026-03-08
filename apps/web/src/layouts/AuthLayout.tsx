import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { AuthLayout as UIAuthLayout } from '@ui/AuthLayout';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirigir según el rol si ya está autenticado
  if (isAuthenticated && user?.rol) {
    switch (user.rol) {
      case 'super_admin':
        return <Navigate to="/super-admin" replace />;
      case 'administrador':
        return <Navigate to="/admin" replace />;
      case 'talent':
        return <Navigate to="/talent" replace />;
      case 'cliente':
        return <Navigate to="/cliente" replace />;
      default:
        return <Navigate to="/admin" replace />;
    }
  }

  return (
    <UIAuthLayout showLogo={false}>
      <Outlet />
    </UIAuthLayout>
  );
}
