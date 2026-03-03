const express = require('express');
const router = express.Router();
const monedasController = require('../controllers/monedasController');
const costosController = require('../controllers/costosController');
const bonosController = require('../controllers/bonosController');
const cortesController = require('../controllers/cortesController');
const recalculosController = require('../controllers/recalculosController');
const senioritiesController = require('../controllers/senioritiesController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * Rutas para Monedas
 */
router.get('/monedas',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  monedasController.listarMonedas
);

/**
 * Rutas para Seniorities
 */
router.get('/seniorities',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  senioritiesController.listarSeniorities
);

router.get('/seniorities/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  senioritiesController.obtenerSeniority
);

router.post('/seniorities',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  senioritiesController.crearSeniority
);

router.put('/seniorities/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  senioritiesController.actualizarSeniority
);

router.delete('/seniorities/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  senioritiesController.eliminarSeniority
);

router.get('/monedas/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  monedasController.obtenerMoneda
);

router.post('/monedas', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  monedasController.crearMoneda
);

router.put('/monedas/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  monedasController.actualizarMoneda
);

router.delete('/monedas/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  monedasController.eliminarMoneda
);

/**
 * Rutas para Costos por Hora
 */
router.get('/costos',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.listarCostos
);

router.get('/costos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.obtenerCosto
);

router.put('/costos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.actualizarCosto
);

router.post('/costos',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.crearCosto
);

router.delete('/costos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.eliminarCosto
);

router.get('/usuarios/:usuario_id/costos',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  costosController.listarCostos
);

router.get('/usuarios/:usuario_id/costo-vigente', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  costosController.obtenerCostoVigente
);

router.post('/usuarios/:usuario_id/costos', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  costosController.crearCosto
);

router.delete('/costos/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  costosController.eliminarCosto
);

/**
 * Rutas para Bonos
 */
router.get('/bonos', 
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.listarBonos
);

router.get('/bonos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.obtenerBono
);

router.post('/bonos',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.crearBono
);

router.put('/bonos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.actualizarBono
);

router.delete('/bonos/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.eliminarBono
);

router.get('/usuarios/:usuario_id/bonos', 
  autenticar,
  verificarRol(['admin', 'super_admin']),
  bonosController.listarBonosUsuario
);

router.post('/usuarios/:usuario_id/bonos', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  bonosController.asignarBono
);

router.delete('/bonos-usuarios/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  bonosController.eliminarBonoUsuario
);

router.get('/bonos/aplicables', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  bonosController.obtenerBonosAplicables
);

/**
 * Rutas para Cortes Mensuales
 */
router.post('/cortes/generar', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  cortesController.generarCortes
);

router.get('/cortes', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  cortesController.listarCortes
);

router.get('/cortes/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  cortesController.obtenerDetalleCorte
);

router.put('/cortes/:id/estado', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  cortesController.actualizarEstadoCorte
);

/**
 * Rutas para Recálculos
 */
router.post('/cortes/:id/recalcular', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  recalculosController.recalcularCorte
);

router.get('/cortes/:id/recalculos', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  recalculosController.listarRecalculos
);

module.exports = router;
