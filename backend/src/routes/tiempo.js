const express = require('express');
const router = express.Router();
const trimestresController = require('../controllers/trimestresController');
const sprintsController = require('../controllers/sprintsController');
const hitosController = require('../controllers/hitosController');
const actividadesController = require('../controllers/actividadesController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * Rutas para Trimestres
 */
router.get('/trimestres', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.listarTrimestres
);

router.get('/trimestres/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.obtenerTrimestre
);

router.post('/trimestres', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.crearTrimestre
);

router.put('/trimestres/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.actualizarTrimestre
);

router.delete('/trimestres/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.eliminarTrimestre
);

router.post('/trimestres/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  trimestresController.recuperarTrimestre
);

/**
 * Rutas para Sprints
 */
router.get('/sprints', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.listarSprints
);

router.get('/sprints/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.obtenerSprint
);

router.post('/sprints', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.crearSprint
);

router.put('/sprints/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.actualizarSprint
);

router.delete('/sprints/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.eliminarSprint
);

router.post('/sprints/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  sprintsController.recuperarSprint
);

/**
 * Rutas para Hitos
 */
router.get('/hitos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.listarHitos
);

router.get('/hitos/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.obtenerHito
);

router.post('/hitos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.crearHito
);

router.put('/hitos/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.actualizarHito
);

router.delete('/hitos/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.eliminarHito
);

router.post('/hitos/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  hitosController.recuperarHito
);

/**
 * Rutas para Actividades
 */
router.get('/actividades', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.listarActividades
);

router.get('/actividades/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.obtenerActividad
);

router.post('/actividades', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.crearActividad
);

router.put('/actividades/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.actualizarActividad
);

router.delete('/actividades/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.eliminarActividad
);

router.post('/actividades/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.recuperarActividad
);

router.post('/actividades/:id/asignar-sprints', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  actividadesController.asignarSprints
);

router.get('/proyectos/:proyecto_id/actividades-asignadas', 
  autenticar,
  actividadesController.obtenerActividadesAsignadas
);

module.exports = router;
