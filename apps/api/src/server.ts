import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { corsOptions } from './config/cors.js';
import { errorHandler, requestLogger } from './middleware/error.middleware.js';
import { morganStream } from './config/logger.js';
import routes from './routes/index.js';
import logger from './config/logger.js';

// Cargar variables de entorno (solo backend - configuración sensible)
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ==========================================
// CONFIGURACIÓN DE SUBCARPETA (APP_SUBPATH)
// ==========================================
// Permite desplegar en subcarpeta sin rebuild
// Ejemplos: "sprintask", "app", "mi-app"
// Dejar vacío para desplegar en raíz del dominio
// ==========================================
const APP_SUBPATH = (process.env.APP_SUBPATH || '').trim();

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));

// Middleware de logging (JSON para logs estructurados)
app.use(requestLogger);

// Parseo de body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HEALTH CHECKS (públicos, sin autenticación)
// ==========================================

// Health check en raíz (siempre disponible)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check estándar API (siempre disponible)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Si hay subcarpeta configurada, agregar rutas adicionales
if (APP_SUBPATH) {
  // Health check en subcarpeta (ej: /sprintask/health)
  app.get(`/${APP_SUBPATH}/health`, (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Health check API en subcarpeta (ej: /sprintask/api/health)
  app.get(`/${APP_SUBPATH}/api/health`, (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Rutas API en subcarpeta (ej: /sprintask/api/*)
  app.use(`/${APP_SUBPATH}/api`, routes);

  logger.info('📁 Subcarpeta configurada', { subpath: APP_SUBPATH });
}

// Rutas API en raíz (siempre disponible)
app.use('/api', routes);

// Middleware de error (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
// Passenger usa process.env.PORT o process.env.PASSENGER_PORT
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const DISPLAY_HOST = process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL || 'pixelycodigo.com')
  : 'localhost';

app.listen(PORT, HOST, () => {
  logger.info('🚀 SprinTask API iniciada', {
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV || 'development',
    database: process.env.DB_NAME || 'sprintask',
  });
  console.log(`🚀 SprinTask API corriendo en http://${DISPLAY_HOST}:${PORT}`);
  console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Base de datos: ${process.env.DB_NAME || 'sprintask'}`);
  console.log(`📝 Logs disponibles en: apps/api/logs/`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('🛑 Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

export default app;
