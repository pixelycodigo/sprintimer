import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { setBuildPathFn } from '@ui/QuickActions';
import App from './App';
import './index.css';
import { initApiUrl } from './services/api';
import { buildPath } from './utils/getBasePath';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Registrar la función buildPath en QuickActions para rutas relativas
setBuildPathFn(buildPath);

// Aplicar tema inicial antes de renderizar
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-storage');
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme);
      const theme = parsed.state?.theme || parsed.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignorar errores de parseo
    }
  }
}

// Componente que carga la configuración runtime antes de iniciar la app
function AppWithConfig() {
  const [baseUrl, setBaseUrl] = useState<string>('/');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Cargar config.json con cache busting (ruta relativa desde index.html)
    const timestamp = new Date().getTime();

    fetch(`./config.json?v=${timestamp}`)
      .then((res) => res.json())
      .then(async (data) => {
        // config.json es la única fuente de verdad
        const configBaseUrl = data.baseUrl || '/';
        setBaseUrl(configBaseUrl);

        // Establecer variable global para getBasePath() y getLoginPath()
        window.__APP_BASE_URL__ = configBaseUrl;

        // Establecer <base href> dinámicamente para rutas relativas
        const baseElement = document.querySelector('base');
        if (baseElement) {
          baseElement.href = configBaseUrl;
        } else {
          const newBase = document.createElement('base');
          newBase.href = configBaseUrl;
          document.head.prepend(newBase);
        }

        // Inicializar URL de la API pasando el valor directamente (evita doble fetch)
        await initApiUrl(data.apiUrl || '/api');

        setLoaded(true);
      })
      .catch(async () => {
        // Fallback solo si no hay config.json (normal en desarrollo)
        setBaseUrl('/');
        await initApiUrl('/api');
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Cargando configuración...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={baseUrl}>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWithConfig />);
