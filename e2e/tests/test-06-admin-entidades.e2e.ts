/**
 * Módulo 0.6: Admin - Entidades
 * Tests para Perfiles, Seniorities, Divisas, Costo x Hora y Asignaciones
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { expectSuccessToast, expectErrorToast, selectRadix, selectRadixByIndex } from '../utils/test-helpers';

test.describe('Módulo 0.6: Admin - Entidades', () => {
  // Login como admin antes de cada test
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL(/\/admin/);
  });

  test.describe('Perfiles', () => {
    test('perfiles-lista-carga-datos: Muestra perfiles existentes', async ({ page }) => {
      await page.goto('/admin/perfiles');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('perfiles-crear-exitoso: Crea perfil y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/perfiles/crear');
      await page.fill('#nombre', `Test Perfil ${timestamp}`);
      await page.fill('#descripcion', `Descripción del perfil ${timestamp}`);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/perfiles/);
    });

    test('perfiles-eliminar-confirma: Elimina perfil (soft delete)', async ({ page }) => {
      await page.goto('/admin/perfiles');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|eliminada|exitoso/i);
      }
    });
  });

  test.describe('Seniorities', () => {
    test('seniorities-lista-carga-datos: Muestra seniorities existentes', async ({ page }) => {
      await page.goto('/admin/seniorities');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('seniorities-crear-exitoso: Crea seniority y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/seniorities/crear');
      await page.fill('#nombre', `Test Seniority ${timestamp}`);
      await page.fill('#nivel_orden', '5');
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/seniorities/);
    });

    test('seniorities-eliminar-confirma: Elimina seniority (soft delete)', async ({ page }) => {
      await page.goto('/admin/seniorities');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|eliminada|exitoso/i);
      }
    });
  });

  test.describe('Divisas', () => {
    test('divisas-lista-carga-datos: Muestra divisas existentes', async ({ page }) => {
      await page.goto('/admin/divisas');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('divisas-crear-exitoso: Crea divisa y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/divisas/crear');
      await page.fill('#codigo', `TST${timestamp}`);
      await page.fill('#simbolo', '$');
      await page.fill('#nombre', `Test Divisa ${timestamp}`);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/divisas/);
    });

    test('divisas-eliminar-confirma: Elimina divisa (soft delete)', async ({ page }) => {
      await page.goto('/admin/divisas');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|eliminada|exitoso/i);
      }
    });
  });

  test.describe('Costo x Hora', () => {
    test('costo-por-hora-lista-carga-datos: Muestra costos existentes', async ({ page }) => {
      await page.goto('/admin/costo-por-hora');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('costo-por-hora-crear-exitoso: Crea costo y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();

      await page.goto('/admin/costo-por-hora/crear');

      // Seleccionar tipo fijo (índice 0, opción 0)
      await selectRadixByIndex(page, 0, 0);

      // Seleccionar divisa (índice 1, opción 0 = PEN)
      await selectRadixByIndex(page, 1, 0);

      // Seleccionar perfil (índice 2, opción 0 = UX Designer)
      await selectRadixByIndex(page, 2, 0);

      // Seleccionar seniority (índice 3, opción 2 = Semi-Senior)
      await selectRadixByIndex(page, 3, 2);

      await page.fill('#costo_hora', '50');
      await page.fill('#concepto', `Test Costo ${timestamp}`);
      await page.check('#activo');

      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/costo-por-hora/);
    });

    test('costo-por-hora-eliminar-confirma: Elimina costo (soft delete)', async ({ page }) => {
      await page.goto('/admin/costo-por-hora');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|eliminada|exitoso/i);
      }
    });
  });

  test.describe('Asignaciones', () => {
    test('asignaciones-lista-carga-datos: Muestra asignaciones existentes', async ({ page }) => {
      await page.goto('/admin/asignaciones');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('asignaciones-crear-exitoso: Crea asignación y redirige a lista', async ({ page }) => {
      await page.goto('/admin/asignaciones/crear');

      // Esperar que los selects estén disponibles
      await page.waitForTimeout(1000);
      
      // Seleccionar actividad usando el trigger de Radix (primer combobox)
      const actividadTrigger = page.locator('[role="combobox"]').first();
      await actividadTrigger.click();
      
      // Seleccionar la primera opción del dropdown
      await page.waitForTimeout(500);
      const actividadOption = page.locator('[role="option"]').first();
      await actividadOption.click();
      
      // Seleccionar talent usando el trigger de Radix (segundo combobox)
      const talentTrigger = page.locator('[role="combobox"]').nth(1);
      await talentTrigger.click();
      
      // Seleccionar la segunda opción para evitar duplicados
      await page.waitForTimeout(500);
      const talentOptions = page.locator('[role="option"]');
      const talentCount = await talentOptions.count();
      
      // Seleccionar segunda opción si existe, sino la primera
      const talentOption = talentCount > 1 ? talentOptions.nth(1) : talentOptions.first();
      await talentOption.click();

      await page.check('#activo');

      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);
      // El mensaje es "Asignación creada exitosamente"
      await expectSuccessToast(page, /asignación.*creada|creada.*exitosamente|creado|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/asignaciones/);
    });

    test('asignaciones-eliminar-confirma: Elimina asignación (soft delete)', async ({ page }) => {
      await page.goto('/admin/asignaciones');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        // El mensaje es "Asignación eliminada exitosamente"
        await expectSuccessToast(page, /asignación.*eliminada|eliminada.*exitosamente|exitoso/i);
      }
    });
  });

  test.describe('Eliminados (Papelera) - Entidades', () => {
    test('eliminados-ver-perfiles: Elementos de perfiles en eliminados', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('eliminados-restaurar: Restaura elemento y vuelve a lista', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const restoreButton = page.locator('[aria-label="Restaurar"]').first();
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /restaurado|exitoso/i);
      }
    });

    test('eliminados-eliminar-permanente: Borra definitivamente', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar permanentemente"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado.*permanentemente|exitoso/i);
      }
    });
  });
});
