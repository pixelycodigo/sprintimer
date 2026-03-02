const express = require('express');
const router = express.Router();
const eliminadosController = require('../controllers/eliminadosController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/eliminados
 * @desc    Listar elementos eliminados (con filtros)
 * @access  Privado (Admin, Super Admin)
 */
router.get('/',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.listarEliminados
);

/**
 * @route   GET /api/admin/eliminados/resumen
 * @desc    Obtener resumen de la papelera
 * @access  Privado (Admin, Super Admin)
 */
router.get('/resumen',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.obtenerResumenPapelera
);

/**
 * @route   GET /api/admin/eliminados/:id
 * @desc    Obtener detalle de un elemento eliminado
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.obtenerDetalleEliminado
);

/**
 * @route   POST /api/admin/eliminados/:id/recuperar
 * @desc    Recuperar elemento eliminado
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/recuperar',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.recuperarEliminado
);

/**
 * @route   DELETE /api/admin/eliminados/:id/permanente
 * @desc    Eliminar permanentemente un elemento individual
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/eliminados/:id/permanente', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.eliminarPermanenteIndividual
);

/**
 * @route   POST /api/admin/eliminados/eliminar-multiple
 * @desc    Eliminar permanentemente múltiples elementos
 * @access  Privado (Admin, Super Admin)
 */
router.post('/eliminados/eliminar-multiple', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.eliminarPermanenteMultiple
);

/**
 * @route   DELETE /api/admin/eliminados/vaciar-todos
 * @desc    Vaciar toda la papelera de eliminados
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/eliminados/vaciar-todos', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.vaciarTodosEliminados
);

/**
 * @route   GET /api/admin/eliminados/configuracion/dias
 * @desc    Obtener configuración de días de retención
 * @access  Privado (Admin, Super Admin)
 */
router.get('/eliminados/configuracion/dias', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.obtenerConfiguracion
);

/**
 * @route   PUT /api/admin/eliminados/configuracion/dias/:entidad
 * @desc    Actualizar configuración de días de retención
 * @access  Privado (Admin, Super Admin)
 */
router.put('/eliminados/configuracion/dias/:entidad', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  eliminadosController.actualizarConfiguracion
);

module.exports = router;
