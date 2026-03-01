import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario autenticado
    const initAuth = async () => {
      const token = authService.getToken();
      const storedUser = authService.getUser();
      
      if (token && storedUser) {
        try {
          // Verificar token válido
          const response = await authService.getCurrentUser();
          setUser(response.usuario);
        } catch (error) {
          // Token inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.usuario);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const registro = async (nombre, email, password) => {
    return await authService.registro(nombre, email, password);
  };

  const cambiarPassword = async (passwordActual, passwordNuevo) => {
    return await authService.cambiarPassword(passwordActual, passwordNuevo);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registro,
    cambiarPassword,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin' || user?.rol === 'super_admin',
    isSuperAdmin: user?.rol === 'super_admin',
    isUsuario: user?.rol === 'usuario',
    debeCambiarPassword: user?.debe_cambiar_password,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
