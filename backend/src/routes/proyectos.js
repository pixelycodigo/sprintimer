const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/proyectos
 * @desc    Listar proyectos (con paginación y filtros)
 * @access  Privado (Admin, Super Admin)
 */
router.get('/', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.listarProyectos
);

/**
 * @route   GET /api/admin/proyectos/:id
 * @desc    Obtener proyecto por ID
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.obtenerProyecto
);

/**
 * @route   POST /api/admin/proyectos
 * @desc    Crear proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.post('/', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.crearProyecto
);

/**
 * @route   PUT /api/admin/proyectos/:id
 * @desc    Actualizar proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.put('/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.actualizarProyecto
);

/**
 * @route   DELETE /api/admin/proyectos/:id
 * @desc    Eliminar proyecto (soft delete)
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/:id', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.eliminarProyecto
);

/**
 * @route   POST /api/admin/proyectos/:id/recuperar
 * @desc    Recuperar proyecto eliminado
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/recuperar', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.recuperarProyecto
);

/**
 * @route   GET /api/admin/proyectos/:id/usuarios
 * @desc    Obtener usuarios asignados a un proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id/usuarios', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.obtenerUsuariosAsignados
);

/**
 * @route   POST /api/admin/proyectos/:id/asignar-usuario
 * @desc    Asignar usuario a proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/asignar-usuario', 
  autenticar, 
  verificarRol(['admin', 'super_admin']),
  proyectosController.asignarUsuarioAProyecto
);

/**
 * @route   DELETE /api/admin/proyectos/:id/desasignar-usuario/:usuario_id
 * @desc    Desasignar usuario de proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/:id/desasignar-usuario/:usuario_id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  proyectosController.desasignarUsuarioDeProyecto
);

/**
 * @route   PUT /api/admin/proyectos/:id/usuarios/:usuario_id
 * @desc    Actualizar perfil de usuario en proyecto
 * @access  Privado (Admin, Super Admin)
 */
router.put('/:id/usuarios/:usuario_id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  proyectosController.actualizarPerfilUsuario
);

module.exports = router;
