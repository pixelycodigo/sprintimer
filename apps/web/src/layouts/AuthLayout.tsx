import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Outlet />
      </div>
    </div>
  );
}
