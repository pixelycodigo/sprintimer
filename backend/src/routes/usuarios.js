const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { autenticar, verificarRol, verificarNivelRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/usuarios
 * @desc    Listar usuarios (con paginación y filtros)
 * @access  Privado (Admin, Super Admin)
 */
router.get('/',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  async (req, res) => {
    // Si es superadmin, solo mostrar usuarios con rol 'usuario' (admins)
    if (req.usuario.rol === 'super_admin') {
      req.query.rol = 'usuario';
    }
    await usuariosController.listarUsuarios(req, res);
  }
);

/**
 * @route   GET /api/super-admin/usuarios/all
 * @desc    Listar todos los usuarios (admins + team members)
 * @access  Privado (Super Admin)
 */
router.get('/all',
  autenticar,
  verificarRol(['super_admin']),
  async (req, res) => {
    // Superadmin puede ver todos los usuarios sin filtro de rol
    await usuariosController.listarUsuarios(req, res);
  }
);

/**
 * @route   GET /api/admin/usuarios/:id
 * @desc    Obtener usuario por ID
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.obtenerUsuario
);

/**
 * @route   POST /api/admin/usuarios
 * @desc    Crear usuario
 * @access  Privado (Admin, Super Admin)
 */
router.post('/', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.crearUsuario
);

/**
 * @route   PUT /api/admin/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Privado (Admin, Super Admin)
 */
router.put('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.actualizarUsuario
);

/**
 * @route   DELETE /api/admin/usuarios/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.eliminarUsuario
);

/**
 * @route   POST /api/admin/usuarios/:id/recuperar
 * @desc    Recuperar usuario eliminado
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.recuperarUsuario
);

/**
 * @route   POST /api/admin/usuarios/:id/cambiar-password
 * @desc    Cambiar contraseña de usuario
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/cambiar-password', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  usuariosController.cambiarPasswordUsuario
);

module.exports = router;
