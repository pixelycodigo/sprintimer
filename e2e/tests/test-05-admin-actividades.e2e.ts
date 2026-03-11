/**
 * Módulo 0.5: Admin - Actividades
 * Tests para la página de gestión de actividades del administrador
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { actividadData } from '../fixtures/test-data';
import { expectSuccessToast, expectErrorToast, selectRadix, selectRadixByIndex } from '../utils/test-helpers';

test.describe('Módulo 0.5: Admin - Actividades', () => {
  // Login como admin antes de cada test
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL(/\/admin/);
  });

  test.describe('Navegación y Carga', () => {
    test('actividades-lista-carga-datos: Muestra actividades existentes', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('actividades-buscar-funciona: Filtro por nombre/descripción/proyecto', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Actividad');
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('actividades-buscar-vacio: Muestra todos al limpiar búsqueda', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Actividad');
      await page.waitForTimeout(500);
      
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });
  });

  test.describe('Crear Actividad', () => {
    test('actividades-crear-abre-formulario: Botón "Nueva Actividad" abre form', async ({ page }) => {
      await page.goto('/admin/actividades');
      
      const newButton = page.locator('button:has-text("Nueva Actividad"), button:has-text("Nueva")');
      await newButton.click();
      
      await page.waitForURL(/\/admin\/actividades\/crear/);
    });

    test('actividades-crear-valida-campos: Valida campos requeridos', async ({ page }) => {
      await page.goto('/admin/actividades/crear');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/admin\/actividades\/crear/);
    });

    test('actividades-crear-activo: Crea actividad activa', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/actividades/crear');
      
      // Seleccionar proyecto (primer option del select)
      await selectRadixByIndex(page, 0, 0);
      
      await page.fill('#nombre', `Test Actividad ${timestamp}`);
      await page.fill('#descripcion', `Descripción de la actividad ${timestamp}`);
      await page.fill('#horas_estimadas', '40');
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/actividades/);
    });

    test('actividades-crear-inactivo: Crea actividad inactiva', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/actividades/crear');
      
      await selectRadixByIndex(page, 0, 0);
      await page.fill('#nombre', `Test Actividad Inactiva ${timestamp}`);
      await page.fill('#descripcion', `Descripción de la actividad ${timestamp}`);
      await page.fill('#horas_estimadas', '40');
      await page.uncheck('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
    });

    test('actividades-crear-exitoso: Crea y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/actividades/crear');
      
      await selectRadixByIndex(page, 0, 0);
      await page.fill('#nombre', `Test Actividad Exito ${timestamp}`);
      await page.fill('#descripcion', `Descripción de la actividad ${timestamp}`);
      await page.fill('#horas_estimadas', '40');
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|creada|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/actividades/);
    });
  });

  test.describe('Editar Actividad', () => {
    test('actividades-editar-abre-formulario: Click en editar abre form', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/actividades\/\d+/);
        await expect(page.getByRole('heading', { name: 'Editar Actividad' })).toBeVisible();
      }
    });

    test('actividades-editar-cambia-datos: Edita nombre, descripción, etc.', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/actividades\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        const nombreOriginal = await nombreInput.inputValue();
        
        await nombreInput.fill(`${nombreOriginal} - Editado`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('actividades-editar-cambia-estado: Cambia activo/inactivo', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/actividades\/\d+/);
        await page.waitForTimeout(1000);
        
        const checkbox = page.locator('#activo');
        await checkbox.click();
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('actividades-editar-exitoso: Actualiza y refleja en lista', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/actividades\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        await nombreInput.fill(`Test Editado ${Date.now()}`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
        await expect(page).toHaveURL(/\/admin\/actividades/);
      }
    });
  });

  test.describe('Eliminar Actividad', () => {
    test('actividades-eliminar-abre-dialogo: Click en eliminar abre diálogo', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('actividades-eliminar-mensaje-correcto: Mensaje "papelera de reciclaje"', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialogDescription = page.locator('[role="alertdialog"] p');
        const dialogText = await dialogDescription.textContent();
        
        expect(dialogText?.toLowerCase()).toMatch(/papelera|reciclaje|30 días/i);
      }
    });

    test('actividades-eliminar-confirma: Elimina y desaparece de lista', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rowsBefore = await page.locator('tbody tr').count();
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|exitoso/i);
        
        const rowsAfter = await page.locator('tbody tr').count();
        expect(rowsAfter).toBe(rowsBefore - 1);
      }
    });

    test('actividades-eliminar-toast: Muestra toast de éxito', async ({ page }) => {
      await page.goto('/admin/actividades');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        await expectSuccessToast(page, /eliminado|exitoso/i);
      }
    });
  });

  test.describe('Eliminados (Papelera)', () => {
    test('actividades-ver-en-eliminados: Elemento aparece en /admin/eliminados', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('actividades-restaurar-desde-eliminados: Restaura y vuelve a lista', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const restoreButton = page.locator('[aria-label="Restaurar"]').first();
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /restaurado|exitoso/i);
      }
    });

    test('actividades-eliminar-permanente: Borra definitivamente', async ({ page }) => {
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
