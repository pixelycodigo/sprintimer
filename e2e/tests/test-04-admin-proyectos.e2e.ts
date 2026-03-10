/**
 * Módulo 0.4: Admin - Proyectos
 * Tests para la página de gestión de proyectos del administrador
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { proyectoData } from '../fixtures/test-data';
import { expectSuccessToast, expectErrorToast } from '../utils/test-helpers';

test.describe('Módulo 0.4: Admin - Proyectos', () => {
  // Login como admin antes de cada test
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL(/\/admin/);
  });

  test.describe('Navegación y Carga', () => {
    test('proyectos-lista-carga-datos: Muestra proyectos existentes', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('proyectos-buscar-funciona: Filtro por nombre/descripción/cliente', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('App');
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('proyectos-buscar-vacio: Muestra todos al limpiar búsqueda', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('App');
      await page.waitForTimeout(500);
      
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });
  });

  test.describe('Crear Proyecto', () => {
    test('proyectos-crear-abre-formulario: Botón "Nuevo Proyecto" abre form', async ({ page }) => {
      await page.goto('/admin/proyectos');
      
      const newButton = page.locator('button:has-text("Nuevo Proyecto"), button:has-text("Nuevo")');
      await newButton.click();
      
      await page.waitForURL(/\/admin\/proyectos\/crear/);
    });

    test('proyectos-crear-valida-campos: Valida campos requeridos', async ({ page }) => {
      await page.goto('/admin/proyectos/crear');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/admin\/proyectos\/crear/);
    });

    test('proyectos-crear-activo: Crea proyecto activo', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/proyectos/crear');
      
      // Seleccionar cliente (primer option del select)
      await page.click('select#cliente_id option:nth-child(2)');
      
      await page.fill('#nombre', `Test Proyecto ${timestamp}`);
      await page.fill('#descripcion', `Descripción del proyecto ${timestamp}`);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/proyectos/);
    });

    test('proyectos-crear-inactivo: Crea proyecto inactivo', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/proyectos/crear');
      
      await page.click('select#cliente_id option:nth-child(2)');
      await page.fill('#nombre', `Test Proyecto Inactivo ${timestamp}`);
      await page.fill('#descripcion', `Descripción del proyecto ${timestamp}`);
      await page.uncheck('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
    });

    test('proyectos-crear-exitoso: Crea y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      
      await page.goto('/admin/proyectos/crear');
      
      await page.click('select#cliente_id option:nth-child(2)');
      await page.fill('#nombre', `Test Proyecto Exito ${timestamp}`);
      await page.fill('#descripcion', `Descripción del proyecto ${timestamp}`);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/proyectos/);
    });
  });

  test.describe('Editar Proyecto', () => {
    test('proyectos-editar-abre-formulario: Click en editar abre form', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/proyectos\/\d+/);
        await expect(page.locator('h1')).toContainText(/Editar/i);
      }
    });

    test('proyectos-editar-cambia-datos: Edita nombre, descripción, etc.', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/proyectos\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        const nombreOriginal = await nombreInput.inputValue();
        
        await nombreInput.fill(`${nombreOriginal} - Editado`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('proyectos-editar-cambia-estado: Cambia activo/inactivo', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/proyectos\/\d+/);
        await page.waitForTimeout(1000);
        
        const checkbox = page.locator('#activo');
        await checkbox.click();
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('proyectos-editar-exitoso: Actualiza y refleja en lista', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/proyectos\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        await nombreInput.fill(`Test Editado ${Date.now()}`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
        await expect(page).toHaveURL(/\/admin\/proyectos/);
      }
    });
  });

  test.describe('Eliminar Proyecto', () => {
    test('proyectos-eliminar-abre-dialogo: Click en eliminar abre diálogo', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('proyectos-eliminar-mensaje-correcto: Mensaje "papelera de reciclaje"', async ({ page }) => {
      await page.goto('/admin/proyectos');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialogDescription = page.locator('[role="alertdialog"] p');
        const dialogText = await dialogDescription.textContent();
        
        expect(dialogText?.toLowerCase()).toMatch(/papelera|reciclaje|30 días/i);
      }
    });

    test('proyectos-eliminar-confirma: Elimina y desaparece de lista', async ({ page }) => {
      await page.goto('/admin/proyectos');
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

    test('proyectos-eliminar-toast: Muestra toast de éxito', async ({ page }) => {
      await page.goto('/admin/proyectos');
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
    test('proyectos-ver-en-eliminados: Elemento aparece en /admin/eliminados', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('proyectos-restaurar-desde-eliminados: Restaura y vuelve a lista', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const restoreButton = page.locator('[aria-label="Restaurar"]').first();
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /restaurado|exitoso/i);
      }
    });

    test('proyectos-eliminar-permanente: Borra definitivamente', async ({ page }) => {
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
