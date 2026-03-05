import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { superAdminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de super_admin
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/', usuariosController.findAll);
router.post('/', usuariosController.create);
router.get('/:id', usuariosController.findById);
router.put('/:id', usuariosController.update);
router.put('/:id/password', usuariosController.changePassword);
router.delete('/:id', usuariosController.delete);

export default router;
