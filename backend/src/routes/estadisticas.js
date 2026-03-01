const express = require('express');
const router = express.Router();
const estadisticasAdminController = require('../controllers/estadisticasAdminController');
const estadisticasUsuarioController = require('../controllers/estadisticasUsuarioController');
const planificacionController = require('../controllers/planificacionController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * Rutas de Estadísticas para Administrador
 */
router.get('/admin/resumen', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.obtenerResumenGeneral
);

router.get('/admin/horas-por-usuario', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.horasPorUsuario
);

router.get('/admin/horas-por-proyecto', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.horasPorProyecto
);

router.get('/admin/progreso-sprints', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.progresoSprints
);

router.get('/admin/tareas-completadas', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.tareasCompletadasPorUsuario
);

router.get('/admin/horas-por-dia', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  estadisticasAdminController.horasPorDia
);

/**
 * Rutas de Estadísticas para Usuario
 */
router.get('/usuario/resumen', 
  autenticar,
  estadisticasUsuarioController.obtenerResumenUsuario
);

router.get('/usuario/horas-semanales', 
  autenticar,
  estadisticasUsuarioController.horasSemanales
);

router.get('/usuario/historial-tareas', 
  autenticar,
  estadisticasUsuarioController.historialTareas
);

router.get('/usuario/progreso-actividades', 
  autenticar,
  estadisticasUsuarioController.progresoPorActividad
);

router.get('/usuario/horas-por-mes', 
  autenticar,
  estadisticasUsuarioController.horasPorMes
);

/**
 * Rutas de Planificación
 */
router.get('/usuario/planificacion-diaria', 
  autenticar,
  planificacionController.obtenerPlanificacionDiaria
);

router.get('/usuario/calendario-semanal', 
  autenticar,
  planificacionController.obtenerCalendarioSemanal
);

router.get('/usuario/distribucion-horas', 
  autenticar,
  planificacionController.distribucionHorasPorProyecto
);

module.exports = router;
