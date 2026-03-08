import { Router } from 'express';
import { seniorityController } from '../controllers/seniority.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', seniorityController.findAll);
router.post('/', seniorityController.create);
router.get('/:id', seniorityController.findById);
router.put('/:id', seniorityController.update);
router.delete('/:id', seniorityController.delete);

export default router;
