const express = require('express');
const router = express.Router();
const monedasController = require('../controllers/monedasController');
const costosController = require('../controllers/costosController');
const bonosController = require('../controllers/bonosController');
const cortesController = require('../controllers/cortesController');
const recalculosController = require('../controllers/recalculosController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * Rutas para Monedas
 */
router.get('/monedas', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  monedasController.listarMonedas
);

router.get('/monedas/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  monedasController.obtenerMoneda
);

router.post('/monedas', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  monedasController.crearMoneda
);

router.put('/monedas/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  monedasController.actualizarMoneda
);

router.delete('/monedas/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  monedasController.eliminarMoneda
);

/**
 * Rutas para Costos por Hora
 */
router.get('/usuarios/:usuario_id/costos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  costosController.listarCostos
);

router.get('/usuarios/:usuario_id/costo-vigente', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  costosController.obtenerCostoVigente
);

router.post('/usuarios/:usuario_id/costos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  costosController.crearCosto
);

router.delete('/costos/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  costosController.eliminarCosto
);

/**
 * Rutas para Bonos
 */
router.get('/bonos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  bonosController.listarBonos
);

router.get('/usuarios/:usuario_id/bonos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  bonosController.listarBonosUsuario
);

router.post('/usuarios/:usuario_id/bonos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  bonosController.asignarBono
);

router.delete('/bonos-usuarios/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  bonosController.eliminarBonoUsuario
);

router.get('/bonos/aplicables', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  bonosController.obtenerBonosAplicables
);

/**
 * Rutas para Cortes Mensuales
 */
router.post('/cortes/generar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  cortesController.generarCortes
);

router.get('/cortes', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  cortesController.listarCortes
);

router.get('/cortes/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  cortesController.obtenerDetalleCorte
);

router.put('/cortes/:id/estado', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  cortesController.actualizarEstadoCorte
);

/**
 * Rutas para Recálculos
 */
router.post('/cortes/:id/recalcular', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  recalculosController.recalcularCorte
);

router.get('/cortes/:id/recalculos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  recalculosController.listarRecalculos
);

module.exports = router;
