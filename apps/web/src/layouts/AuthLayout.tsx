import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { AuthLayout as UIAuthLayout } from '@ui/AuthLayout';
import { getBasePath } from '../utils/getBasePath';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const basePath = getBasePath();

  // Función auxiliar para construir rutas con basePath
  const buildPath = (path: string) => {
    return basePath ? `${basePath}${path}` : path;
  };

  // Redirigir según el rol si ya está autenticado
  if (isAuthenticated && user?.rol) {
    switch (user.rol) {
      case 'super_admin':
        return <Navigate to={buildPath('/super-admin')} replace />;
      case 'administrador':
        return <Navigate to={buildPath('/admin')} replace />;
      case 'talent':
        return <Navigate to={buildPath('/talent')} replace />;
      case 'cliente':
        return <Navigate to={buildPath('/cliente')} replace />;
      default:
        return <Navigate to={buildPath('/admin')} replace />;
    }
  }

  return (
    <UIAuthLayout showLogo={false}>
      <Outlet />
    </UIAuthLayout>
  );
}
