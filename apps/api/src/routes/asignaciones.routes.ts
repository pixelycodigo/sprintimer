import { Router } from 'express';
import { asignacionController } from '../controllers/asignacion.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', asignacionController.findAll);
router.post('/', asignacionController.create);
router.put('/:id', asignacionController.update);
router.post('/bulk', asignacionController.createBulk);
router.post('/bulk', asignacionController.deleteBulk);
router.get('/:id', asignacionController.findById);
router.delete('/:id', asignacionController.delete);

export default router;
