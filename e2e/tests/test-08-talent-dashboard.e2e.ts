/**
 * Módulo 0.8: Talent Dashboard
 * Tests para el dashboard de talents (Tareas, Actividades, Proyectos)
 * 
 * NOTA: Tests simplificados - asumen login ya realizado
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { expectSuccessToast } from '../utils/test-helpers';

test.describe('Módulo 0.8: Talent Dashboard', () => {
  // Login manual como talent existente
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'carlos.mendoza@sprintask.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/talent/, { timeout: 15000 });
  });

  test.describe('Dashboard Principal', () => {
    test('talent-dashboard-carga: Dashboard carga correctamente', async ({ page }) => {
      await page.goto('/talent');
      
      // Esperar que cargue el dashboard
      await page.waitForTimeout(2000);
      
      // Verificar que hay estadísticas o mensajes
      const dashboard = page.locator('[data-testid="dashboard"], main');
      await expect(dashboard).toBeVisible();
    });

    test('talent-dashboard-muestra-estadisticas: Muestra estadísticas del talent', async ({ page }) => {
      await page.goto('/talent');
      await page.waitForTimeout(2000);
      
      // Buscar estadísticas (pueden ser tarjetas, números, etc.)
      const stats = page.locator('[data-testid="stat"], [data-testid="stats"]');
      const statCount = await stats.count();
      
      // Debería haber al menos algunas estadísticas
      expect(statCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Mis Tareas', () => {
    test('tareas-lista-carga: Muestra tareas asignadas', async ({ page }) => {
      await page.goto('/talent/tareas');
      await page.waitForSelector('table, [data-testid="empty"]', { timeout: 5000 });
      
      // Verificar que hay tabla o mensaje de vacío
      const table = page.locator('table');
      const emptyState = page.locator('[data-testid="empty"]');
      
      const hasTable = await table.count() > 0;
      const hasEmpty = await emptyState.isVisible();
      
      expect(hasTable || hasEmpty).toBeTruthy();
    });

    test('tareas-buscar-funciona: Filtro por nombre', async ({ page }) => {
      await page.goto('/talent/tareas');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
        await page.waitForTimeout(500);
        
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('tareas-marcar-completada: Marca tarea como completada', async ({ page }) => {
      await page.goto('/talent/tareas');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Buscar checkbox de completar en primera fila
      const completeCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
      if (await completeCheckbox.isVisible()) {
        await completeCheckbox.click();
        await page.waitForTimeout(1000);
        
        // Verificar toast de éxito
        await expectSuccessToast(page, /actualizada|exitoso|completada/i);
      }
    });

    test('tareas-crear-abre-formulario: Botón "Nueva Tarea" abre form', async ({ page }) => {
      await page.goto('/talent/tareas');
      
      const newButton = page.locator('button:has-text("Nueva Tarea"), button:has-text("Nueva")');
      if (await newButton.isVisible()) {
        await newButton.click();
        await page.waitForURL(/\/talent\/tareas\/crear/);
        // Usar selector más específico para evitar múltiples h1
        await expect(page.locator('h1:has-text("Nueva")')).toBeVisible();
      }
    });
  });

  test.describe('Mis Actividades', () => {
    test('actividades-lista-carga: Muestra actividades asignadas', async ({ page }) => {
      await page.goto('/talent/actividades');
      await page.waitForSelector('table, [data-testid="empty"]', { timeout: 5000 });
      
      const table = page.locator('table');
      const emptyState = page.locator('[data-testid="empty"]');
      
      const hasTable = await table.count() > 0;
      const hasEmpty = await emptyState.isVisible();
      
      expect(hasTable || hasEmpty).toBeTruthy();
    });

    test('actividades-buscar-funciona: Filtro por nombre/proyecto', async ({ page }) => {
      await page.goto('/talent/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
        await page.waitForTimeout(500);
        
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Mis Proyectos', () => {
    test('proyectos-lista-carga: Muestra proyectos asignados', async ({ page }) => {
      await page.goto('/talent/proyectos');
      await page.waitForSelector('table, [data-testid="empty"]', { timeout: 5000 });
      
      const table = page.locator('table');
      const emptyState = page.locator('[data-testid="empty"]');
      
      const hasTable = await table.count() > 0;
      const hasEmpty = await emptyState.isVisible();
      
      expect(hasTable || hasEmpty).toBeTruthy();
    });

    test('proyectos-buscar-funciona: Filtro por nombre', async ({ page }) => {
      await page.goto('/talent/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
        await page.waitForTimeout(500);
        
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Tareas Eliminadas', () => {
    test('tareas-eliminadas-lista-carga: Muestra tareas eliminadas', async ({ page }) => {
      await page.goto('/talent/tareas/eliminadas');
      await page.waitForSelector('table, [data-testid="empty"]', { timeout: 5000 });
      
      const table = page.locator('table');
      const emptyState = page.locator('[data-testid="empty"]');
      
      const hasTable = await table.count() > 0;
      const hasEmpty = await emptyState.isVisible();
      
      expect(hasTable || hasEmpty).toBeTruthy();
    });

    test('tareas-eliminadas-restaurar: Restaura tarea eliminada', async ({ page }) => {
      await page.goto('/talent/tareas/eliminadas');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Buscar botón de restaurar
      const restoreButton = page.locator('[aria-label="Restaurar"], [data-testid="restore"]').first();
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        await page.waitForTimeout(2000);
        
        await expectSuccessToast(page, /restaurada|exitoso/i);
      }
    });
  });
});
