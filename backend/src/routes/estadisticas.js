const express = require('express');
const router = express.Router();
const estadisticasAdminController = require('../controllers/estadisticasAdminController');
const estadisticasUsuarioController = require('../controllers/estadisticasUsuarioController');
const planificacionController = require('../controllers/planificacionController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * Rutas de Estadísticas para Administrador
 */
router.get('/resumen',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.obtenerResumenGeneral
);

router.get('/horas-por-usuario',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.horasPorUsuario
);

router.get('/horas-por-proyecto',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.horasPorProyecto
);

router.get('/progreso-sprints',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.progresoSprints
);

router.get('/tareas-completadas',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.tareasCompletadasPorUsuario
);

router.get('/horas-por-dia',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  estadisticasAdminController.horasPorDia
);

/**
 * Rutas de Estadísticas para Usuario
 */
router.get('/resumen',
  autenticar,
  estadisticasUsuarioController.obtenerResumenUsuario
);

router.get('/horas-semanales',
  autenticar,
  estadisticasUsuarioController.horasSemanales
);

router.get('/historial-tareas',
  autenticar,
  estadisticasUsuarioController.historialTareas
);

router.get('/progreso-actividades',
  autenticar,
  estadisticasUsuarioController.progresoPorActividad
);

router.get('/horas-por-mes',
  autenticar,
  estadisticasUsuarioController.horasPorMes
);

/**
 * Rutas de Planificación
 */
router.get('/planificacion-diaria',
  autenticar,
  planificacionController.obtenerPlanificacionDiaria
);

router.get('/calendario-semanal',
  autenticar,
  planificacionController.obtenerCalendarioSemanal
);

router.get('/distribucion-horas',
  autenticar,
  planificacionController.distribucionHorasPorProyecto
);

module.exports = router;
