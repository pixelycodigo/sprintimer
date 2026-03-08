import { Router } from 'express';
import { eliminadoController } from '../controllers/eliminado.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', eliminadoController.findAll);
router.get('/:id', eliminadoController.findById);
router.post('/:id/restaurar', eliminadoController.restore);
router.delete('/:id', eliminadoController.delete);

export default router;
