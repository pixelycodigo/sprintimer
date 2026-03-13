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

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));

// Middleware de logging (JSON para logs estructurados)
app.use(requestLogger);

// Parseo de body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (público, sin autenticación)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas API
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
