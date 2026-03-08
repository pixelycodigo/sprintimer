import { Router } from 'express';
import { proyectoController } from '../controllers/proyecto.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', proyectoController.findAll);
router.post('/', proyectoController.create);
router.get('/:id', proyectoController.findById);
router.put('/:id', proyectoController.update);
router.delete('/:id', proyectoController.delete);

export default router;
