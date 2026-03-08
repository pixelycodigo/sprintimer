import { Router } from 'express';
import { talentDashboardController } from '../controllers/talent-dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { talentMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de talent
router.use(authMiddleware);
router.use(talentMiddleware);

router.get('/', talentDashboardController.getStats);
router.get('/proyectos', talentDashboardController.getProyectos);
router.get('/tareas', talentDashboardController.getTareas);
router.get('/tareas/eliminadas', talentDashboardController.getTareasEliminadas);
router.post('/tareas/eliminadas/:id/restaurar', talentDashboardController.restoreTarea);
router.delete('/tareas/eliminadas/:id', talentDashboardController.deleteTareaPermanente);
router.get('/actividades', talentDashboardController.getActividades);
router.get('/proyectos/:proyectoId/actividades', talentDashboardController.getActividadesByProyecto);
router.patch('/tareas/:id/toggle', talentDashboardController.toggleTarea);
router.put('/tareas/:id', talentDashboardController.updateTarea);
router.delete('/tareas/:id', talentDashboardController.deleteTarea);
router.post('/tareas', talentDashboardController.createTarea);

export default router;
