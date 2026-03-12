import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';

// URL de la API se lee desde config.json en tiempo de ejecución
// Esto permite cambiar la ruta sin rebuild
let API_URL = '/api'; // Valor inicial, se actualiza con initApiUrl()
let BASE_URL = '/'; // Base URL para redirecciones (se actualiza con initApiUrl())

// Función para inicializar la URL de la API y baseUrl desde config.json
export async function initApiUrl() {
  try {
    const response = await fetch('./config.json');
    const config = await response.json();
    API_URL = config.apiUrl;
    BASE_URL = config.baseUrl || '/';

    // Asegurar que baseUrl termine con /
    if (!BASE_URL.endsWith('/')) {
      BASE_URL += '/';
    }

    // Actualizar baseURL de la instancia existente
    api.defaults.baseURL = API_URL;

    console.log('✅ API URL configurada:', API_URL);
    console.log('✅ Base URL configurada:', BASE_URL);
  } catch (error) {
    console.warn('⚠️ No se pudo cargar config.json, usando valores por defecto');
  }
}

// Función para obtener la ruta de login completa
export function getLoginPath(): string {
  // Asegurar que no haya doble slash
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}/login`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bandera para evitar múltiples refresh simultáneos
let isRefreshing = false;
// Cola de peticiones fallidas
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

// Funciones para manejar la cola
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación con refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si el error no es 401 o ya reintentamos, rechazamos
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Verificar si es un error de autenticación real
    const errorMessage = (error.response?.data as any)?.message || '';
    const isAuthError =
      errorMessage.includes('token') ||
      errorMessage.includes('autenticación') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('inválido') ||
      errorMessage.includes('expirado');

    if (!isAuthError) {
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();

    // Si no hay refresh token, cerramos sesión
    if (!refreshToken) {
      useAuthStore.getState().logout();
      window.location.href = getLoginPath();
      return Promise.reject(error);
    }

    // Si ya estamos refrescando, encolamos la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Marcamos como refrescando
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // Intentamos refrescar el token
      const { token, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

      // Actualizamos tokens en el store
      useAuthStore.getState().updateTokens(token, newRefreshToken);

      // Procesamos la cola de peticiones
      processQueue(null, token);

      // Reintentamos la petición original con el nuevo token
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Si falla el refresh, cerramos sesión
      processQueue(error as Error, null);
      useAuthStore.getState().logout();
      window.location.href = getLoginPath();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
