import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', clienteController.findAll);
router.post('/', clienteController.create);
router.get('/:id', clienteController.findById);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.delete);

export default router;
