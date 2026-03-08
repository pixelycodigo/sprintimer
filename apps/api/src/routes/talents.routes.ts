import { Router } from 'express';
import { talentController } from '../controllers/talent.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', talentController.findAll);
router.post('/', talentController.create);
router.get('/:id', talentController.findById);
router.put('/:id', talentController.update);
router.put('/:id/password', talentController.changePassword);
router.delete('/:id', talentController.delete);

export default router;
