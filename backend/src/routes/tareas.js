const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareasController');
const { autenticar } = require('../middleware/auth');

/**
 * @route   POST /api/usuario/tareas
 * @desc    Registrar nueva tarea
 * @access  Privado (Usuario)
 */
router.post('/tareas', 
  autenticar,
  tareasController.registrarTarea
);

/**
 * @route   GET /api/usuario/tareas
 * @desc    Listar mis tareas (con filtros)
 * @access  Privado (Usuario)
 */
router.get('/tareas', 
  autenticar,
  tareasController.listarMisTareas
);

/**
 * @route   GET /api/usuario/tareas/:id
 * @desc    Obtener tarea por ID
 * @access  Privado (Usuario)
 */
router.get('/tareas/:id', 
  autenticar,
  tareasController.obtenerTarea
);

/**
 * @route   PUT /api/usuario/tareas/:id
 * @desc    Actualizar tarea
 * @access  Privado (Usuario)
 */
router.put('/tareas/:id', 
  autenticar,
  tareasController.actualizarTarea
);

/**
 * @route   DELETE /api/usuario/tareas/:id
 * @desc    Eliminar tarea
 * @access  Privado (Usuario)
 */
router.delete('/tareas/:id', 
  autenticar,
  tareasController.eliminarTarea
);

/**
 * @route   GET /api/usuario/tareas/resumen/horas
 * @desc    Obtener resumen de horas por actividad
 * @access  Privado (Usuario)
 */
router.get('/tareas/resumen/horas', 
  autenticar,
  tareasController.obtenerResumenHoras
);

/**
 * @route   GET /api/usuario/tareas/horas-por-dia
 * @desc    Obtener horas registradas por día (calendario)
 * @access  Privado (Usuario)
 */
router.get('/tareas/horas-por-dia', 
  autenticar,
  tareasController.obtenerHorasPorDia
);

module.exports = router;
