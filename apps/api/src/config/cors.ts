import { CorsOptions } from 'cors';

// Configuración CORS dinámica
// En desarrollo usa localhost, en producción verifica contra FRONTEND_URL
const isDevelopment = process.env.NODE_ENV !== 'production';

const allowedOrigins = isDevelopment ? [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter((origin): origin is string => origin !== undefined) : [];

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // En desarrollo, verificar contra allowedOrigins
    if (isDevelopment) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
      return;
    }

    // En producción, verificar contra FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      // Si no hay FRONTEND_URL configurado, permitir cualquier origen (inseguro, solo para debugging)
      callback(null, true);
      return;
    }

    // Verificar si el origen coincide con FRONTEND_URL
    if (origin === frontendUrl || origin === frontendUrl.replace(/\/$/, '')) {
      callback(null, true);
    } else {
      callback(new Error(`No permitido por CORS. Origen: ${origin}, Esperado: ${frontendUrl}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
};
