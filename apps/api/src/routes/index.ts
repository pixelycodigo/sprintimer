import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import clientesRoutes from './clientes.routes.js';
import proyectosRoutes from './proyectos.routes.js';
import talentsRoutes from './talents.routes.js';
import perfilesRoutes from './perfiles.routes.js';
import senioritiesRoutes from './seniorities.routes.js';
import actividadesRoutes from './actividades.routes.js';
import asignacionesRoutes from './asignaciones.routes.js';
import divisasRoutes from './divisas.routes.js';
import costoPorHoraRoutes from './costoPorHora.routes.js';
import eliminadosRoutes from './eliminados.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import clienteDashboardRoutes from './cliente-dashboard.routes.js';
import talentDashboardRoutes from './talent-dashboard.routes.js';
import superAdminDashboardRoutes from './super-admin-dashboard.routes.js';

const router = Router();

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Rutas de Super Admin (requieren autenticación y rol super_admin)
router.use('/super-admin/dashboard', superAdminDashboardRoutes);
router.use('/super-admin/usuarios', usuariosRoutes);

// Rutas de Admin (requieren autenticación y rol administrador)
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/clientes', clientesRoutes);
router.use('/admin/proyectos', proyectosRoutes);
router.use('/admin/talents', talentsRoutes);
router.use('/admin/perfiles', perfilesRoutes);
router.use('/admin/seniorities', senioritiesRoutes);
router.use('/admin/actividades', actividadesRoutes);
router.use('/admin/asignaciones', asignacionesRoutes);
router.use('/admin/divisas', divisasRoutes);
router.use('/admin/costo-por-hora', costoPorHoraRoutes);
router.use('/admin/eliminados', eliminadosRoutes);

// Rutas de Cliente (requieren autenticación y rol cliente)
router.use('/cliente/dashboard', clienteDashboardRoutes);

// Rutas de Talent (requieren autenticación y rol talent)
router.use('/talent/dashboard', talentDashboardRoutes);

export default router;
