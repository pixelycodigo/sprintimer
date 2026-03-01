const express = require('express');
const router = express.Router();
const cortesController = require('../controllers/cortesController');
const { autenticar } = require('../middleware/auth');

/**
 * @route   GET /api/usuario/cortes
 * @desc    Listar mis cortes mensuales
 * @access  Privado (Usuario)
 */
router.get('/cortes', 
  autenticar,
  cortesController.listarCortes
);

/**
 * @route   GET /api/usuario/cortes/:id
 * @desc    Obtener detalle de un corte
 * @access  Privado (Usuario)
 */
router.get('/cortes/:id', 
  autenticar,
  cortesController.obtenerDetalleCorte
);

module.exports = router;
