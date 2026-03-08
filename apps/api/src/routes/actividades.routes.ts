import { Router } from 'express';
import { actividadController } from '../controllers/actividad.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', actividadController.findAll);
router.post('/', actividadController.create);
router.get('/:id', actividadController.findById);
router.put('/:id', actividadController.update);
router.delete('/:id', actividadController.delete);

export default router;
