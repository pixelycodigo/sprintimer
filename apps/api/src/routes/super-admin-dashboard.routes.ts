import { Router } from 'express';
import { superAdminDashboardController } from '../controllers/super-admin-dashboard.controller.js';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de super_admin
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/', superAdminDashboardController.getStats);

export default router;
