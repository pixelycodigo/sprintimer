import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Rutas de Super Admin (requieren autenticación y rol super_admin)
router.use('/super-admin/usuarios', usuariosRoutes);

// Rutas de ejemplo para otras entidades (se irán agregando)
// router.use('/admin/clientes', clientesRoutes);
// router.use('/admin/talents', talentsRoutes);
// etc.

export default router;
