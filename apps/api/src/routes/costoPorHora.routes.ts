import { Router } from 'express';
import { costoPorHoraController } from '../controllers/costoPorHora.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', costoPorHoraController.findAll);
router.post('/', costoPorHoraController.create);
router.get('/:id', costoPorHoraController.findById);
router.put('/:id', costoPorHoraController.update);
router.delete('/:id', costoPorHoraController.delete);

export default router;
