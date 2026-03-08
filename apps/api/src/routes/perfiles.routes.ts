import { Router } from 'express';
import { perfilController } from '../controllers/perfil.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', perfilController.findAll);
router.post('/', perfilController.create);
router.get('/:id', perfilController.findById);
router.put('/:id', perfilController.update);
router.delete('/:id', perfilController.delete);

export default router;
