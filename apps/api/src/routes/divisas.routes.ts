import { Router } from 'express';
import { divisaController } from '../controllers/divisa.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', divisaController.findAll);
router.post('/', divisaController.create);
router.get('/:id', divisaController.findById);
router.put('/:id', divisaController.update);
router.delete('/:id', divisaController.delete);

export default router;
