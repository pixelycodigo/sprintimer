import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';
import { initApiUrl } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    // Cargar configuración desde config.json (ruta relativa)
    fetch('./config.json')
      .then((res) => res.json())
      .then(async (data) => {
        // Usar valores de config.json (sin fallback hardcodeado)
        setBaseUrl(data.baseUrl);
        
        // Inicializar URL de la API desde config.json
        await initApiUrl();
        
        setLoaded(true);
      })
      .catch(async () => {
        // Fallback solo si no hay config.json
        setBaseUrl('/');
        await initApiUrl();
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
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={baseUrl}>
          <App />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWithConfig />);
