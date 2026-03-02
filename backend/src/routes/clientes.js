const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/clientes
 * @desc    Listar clientes (con paginación y filtros)
 * @access  Privado (Admin, Super Admin)
 */
router.get('/', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.listarClientes
);

/**
 * @route   GET /api/admin/clientes/:id
 * @desc    Obtener cliente por ID
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.obtenerCliente
);

/**
 * @route   POST /api/admin/clientes
 * @desc    Crear cliente
 * @access  Privado (Admin, Super Admin)
 */
router.post('/', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.crearCliente
);

/**
 * @route   PUT /api/admin/clientes/:id
 * @desc    Actualizar cliente
 * @access  Privado (Admin, Super Admin)
 */
router.put('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.actualizarCliente
);

/**
 * @route   DELETE /api/admin/clientes/:id
 * @desc    Eliminar cliente (soft delete)
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.eliminarCliente
);

/**
 * @route   POST /api/admin/clientes/:id/recuperar
 * @desc    Recuperar cliente eliminado
 * @access  Privado (Admin, Super Admin)
 */
router.post('/:id/recuperar', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  clientesController.recuperarCliente
);

module.exports = router;
