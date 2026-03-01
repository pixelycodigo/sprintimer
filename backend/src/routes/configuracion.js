const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/proyectos/:id/dias-laborables
 * @desc    Obtener configuración de días laborables
 * @access  Privado (Admin, Super Admin)
 */
router.get('/proyectos/:id/dias-laborables', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  configuracionController.obtenerDiasLaborables
);

/**
 * @route   PUT /api/admin/proyectos/:id/dias-laborables
 * @desc    Actualizar configuración de días laborables
 * @access  Privado (Admin, Super Admin)
 */
router.put('/proyectos/:id/dias-laborables', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  configuracionController.actualizarDiasLaborables
);

/**
 * @route   GET /api/admin/proyectos/:id/costos-no-laborables
 * @desc    Obtener costos de días no laborables
 * @access  Privado (Admin, Super Admin)
 */
router.get('/proyectos/:id/costos-no-laborables', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  configuracionController.obtenerCostosNoLaborables
);

/**
 * @route   POST /api/admin/proyectos/:id/costos-no-laborables
 * @desc    Actualizar costos de días no laborables
 * @access  Privado (Admin, Super Admin)
 */
router.post('/proyectos/:id/costos-no-laborables', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  configuracionController.actualizarCostosNoLaborables
);

/**
 * @route   DELETE /api/admin/costos-no-laborables/:id
 * @desc    Eliminar costo de día no laborable
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/costos-no-laborables/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  configuracionController.eliminarCostoNoLaborable
);

module.exports = router;
