import { Router } from 'express';
import { clienteDashboardController } from '../controllers/cliente-dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { clienteMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de cliente
router.use(authMiddleware);
router.use(clienteMiddleware);

router.get('/', clienteDashboardController.getStats);
router.get('/proyectos', clienteDashboardController.getProyectos);
router.get('/actividades', clienteDashboardController.getActividades);

export default router;
