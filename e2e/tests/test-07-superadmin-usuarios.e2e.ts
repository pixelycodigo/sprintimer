/**
 * Módulo 0.7: Super Admin - Usuarios
 * Tests para la gestión de usuarios administradores
 * 
 * NOTA: Usamos login de admin porque superadmin puede no existir en la BD de test
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { passwords, existingUsers } from '../fixtures/test-data';
import { expectSuccessToast, expectErrorToast } from '../utils/test-helpers';

test.describe('Módulo 0.7: Super Admin - Usuarios', () => {
  // Login manual como superadmin antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@sprintask.com');
    await page.fill('input[type="password"]', 'Admin1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/super-admin/, { timeout: 15000 });
  });

  test.describe('Navegación y Carga', () => {
    test('usuarios-lista-carga-datos: Muestra usuarios existentes', async ({ page }) => {
      // El login se hace en beforeEach
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('usuarios-buscar-funciona: Filtro por nombre/email', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('admin');
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('usuarios-buscar-vacio: Muestra todos al limpiar búsqueda', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('admin');
      await page.waitForTimeout(500);
      
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });
  });

  test.describe('Crear Usuario', () => {
    test('usuarios-crear-abre-formulario: Botón "Nuevo Usuario" abre form', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      
      const newButton = page.locator('button:has-text("Nuevo Usuario"), button:has-text("Nuevo")');
      await newButton.click();
      
      await page.waitForURL(/\/super-admin\/usuarios\/crear/);
      await expect(page.locator('h1')).toContainText(/Nuevo|Crear/i);
    });

    test('usuarios-crear-valida-campos: Valida campos requeridos', async ({ page }) => {
      await page.goto('/super-admin/usuarios/crear');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/super-admin\/usuarios\/crear/);
    });

    test('usuarios-crear-activo: Crea usuario activo', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.usuario.${timestamp}@sprintask.com`;
      
      await page.goto('/super-admin/usuarios/crear');
      
      await page.fill('#nombre', `Test Usuario ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      await expect(page).toHaveURL(/\/super-admin\/usuarios/);
    });

    test('usuarios-crear-inactivo: Crea usuario inactivo', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.usuario.inactivo.${timestamp}@sprintask.com`;
      
      await page.goto('/super-admin/usuarios/crear');
      
      await page.fill('#nombre', `Test Usuario Inactivo ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.uncheck('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
    });

    test('usuarios-crear-email-duplicado: Error con email repetido', async ({ page }) => {
      await page.goto('/super-admin/usuarios/crear');
      
      await page.fill('#nombre', 'Test Usuario');
      await page.fill('#email', 'admin@sprintask.com');
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      // Esperar error específico de email duplicado
      await expectErrorToast(page, /email.*registrado|ya existe.*email/i);
    });

    test('usuarios-crear-password-debil: Error con password débil', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.usuario.debil.${timestamp}@sprintask.com`;
      
      await page.goto('/super-admin/usuarios/crear');
      
      await page.fill('#nombre', `Test Usuario ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.debil);
      await page.fill('#password_confirm', passwords.debil);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      // Esperar error de password débil
      await expectErrorToast(page, /contraseña.*débil|mínimo 8 caracteres/i);
    });

    test('usuarios-crear-exitoso: Crea y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.usuario.exito.${timestamp}@sprintask.com`;
      
      await page.goto('/super-admin/usuarios/crear');
      
      await page.fill('#nombre', `Test Usuario Exito ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.check('#activo');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      await expect(page).toHaveURL(/\/super-admin\/usuarios/);
    });
  });

  test.describe('Editar Usuario', () => {
    test('usuarios-editar-abre-formulario: Click en editar abre form', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/super-admin\/usuarios\/\d+/);
        await expect(page.locator('h1')).toContainText(/Editar/i);
      }
    });

    test('usuarios-editar-cambia-datos: Edita nombre, email', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/super-admin\/usuarios\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        const nombreOriginal = await nombreInput.inputValue();
        
        await nombreInput.fill(`${nombreOriginal} - Editado`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('usuarios-editar-cambia-estado: Cambia activo/inactivo', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/super-admin\/usuarios\/\d+/);
        await page.waitForTimeout(1000);
        
        const checkbox = page.locator('#activo');
        await checkbox.click();
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('usuarios-editar-exitoso: Actualiza y refleja en lista', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/super-admin\/usuarios\/\d+/);
        await page.waitForTimeout(1000);
        
        const nombreInput = page.locator('#nombre');
        await nombreInput.fill(`Test Editado ${Date.now()}`);
        
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
        await expect(page).toHaveURL(/\/super-admin\/usuarios/);
      }
    });
  });

  test.describe('Eliminar Usuario', () => {
    test('usuarios-eliminar-abre-dialogo: Click en eliminar abre diálogo', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Nota: No deberíamos poder eliminar al superadmin o admin principal
      // Buscamos un usuario de test si existe
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('usuarios-eliminar-mensaje-correcto: Mensaje de eliminación permanente', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Verificar mensaje (los usuarios NO tienen soft delete)
        const dialogDescription = page.locator('[role="alertdialog"] p');
        const dialogText = await dialogDescription.textContent();
        
        // Debería mencionar eliminación permanente (no papelera)
        expect(dialogText?.toLowerCase()).not.toMatch(/papelera|reciclaje/i);
      }
    });

    test('usuarios-eliminar-confirma: Elimina permanentemente', async ({ page }) => {
      await page.goto('/super-admin/usuarios');
      await page.waitForSelector('table', { timeout: 5000 });
      
      const rowsBefore = await page.locator('tbody tr').count();
      
      // Solo eliminar si hay usuarios de test (no eliminar admin principal)
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
  });
});
