import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Rutas protegidas
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

export default router;
