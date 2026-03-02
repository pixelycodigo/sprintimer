const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/admin/usuarios', require('./src/routes/usuarios'));
app.use('/api/admin/clientes', require('./src/routes/clientes'));
app.use('/api/admin/proyectos', require('./src/routes/proyectos'));
app.use('/api/admin', require('./src/routes/configuracion'));
app.use('/api/admin/tiempo', require('./src/routes/tiempo'));
app.use('/api/admin/pagos', require('./src/routes/pagos'));
app.use('/api/admin/estadisticas', require('./src/routes/estadisticas'));
app.use('/api/admin/eliminados', require('./src/routes/eliminados'));
app.use('/api/admin/perfiles-team', require('./src/routes/perfiles-team'));
app.use('/api/admin/team-projects', require('./src/routes/team-projects'));
app.use('/api/usuario', require('./src/routes/usuario'));
app.use('/api/usuario/tareas', require('./src/routes/tareas'));
app.use('/api/usuario/cortes', require('./src/routes/usuario-cortes'));
app.use('/api/usuario/estadisticas', require('./src/routes/estadisticas'));
app.use('/api/super-admin', require('./src/routes/super-admin'));

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
