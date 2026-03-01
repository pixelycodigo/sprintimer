const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SprinTimer API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rutas principales
app.use('/api/auth', require('./src/routes/auth'));
// Las siguientes rutas se agregarán en las próximas fases:
// app.use('/api/admin', require('./src/routes/admin'));
// app.use('/api/usuario', require('./src/routes/usuario'));
// app.use('/api/super-admin', require('./src/routes/super-admin'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      status: err.status || 500
    }
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Ruta no encontrada',
      status: 404
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SprinTimer API - Servidor en ejecución              ║
║                                                           ║
║   Puerto: ${PORT}                                          ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                              ║
║   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}                    ║
║                                                           ║
║   Health check: http://localhost:${PORT}/api/health        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
