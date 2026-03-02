const express = require('express');
const router = express.Router();
const teamProjectsController = require('../controllers/teamProjectsController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/team-projects
 * @desc    Listar asignaciones de miembros a proyectos
 * @access  Privado (Admin, Super Admin)
 */
router.get('/team-projects',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.listarAsignaciones
);

/**
 * @route   GET /api/admin/team-projects/:usuario_id/:proyecto_id
 * @desc    Obtener asignación específica
 * @access  Privado (Admin, Super Admin)
 */
router.get('/team-projects/:usuario_id/:proyecto_id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.obtenerAsignacion
);

/**
 * @route   POST /api/admin/team-projects
 * @desc    Asignar miembro a proyecto con perfil
 * @access  Privado (Admin, Super Admin)
 */
router.post('/team-projects',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.asignarMiembro
);

/**
 * @route   PUT /api/admin/team-projects/:usuario_id/:proyecto_id
 * @desc    Actualizar asignación
 * @access  Privado (Admin, Super Admin)
 */
router.put('/team-projects/:usuario_id/:proyecto_id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.actualizarAsignacion
);

/**
 * @route   DELETE /api/admin/team-projects/:usuario_id/:proyecto_id
 * @desc    Desasignar miembro de proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/team-projects/:usuario_id/:proyecto_id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.desasignarMiembro
);

/**
 * @route   GET /api/admin/proyectos/:id/miembros-asignados
 * @desc    Obtener miembros asignados a un proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.get('/proyectos/:id/miembros-asignados',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  teamProjectsController.obtenerMiembrosAsignados
);

module.exports = router;
