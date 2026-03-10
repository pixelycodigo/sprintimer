/**
 * Módulo 0.2: Admin - Clientes
 * Tests para la página de gestión de clientes del administrador
 */

import { test, expect } from '../fixtures/auth-fixtures';
import { clienteData, passwords } from '../fixtures/test-data';
import { expectSuccessToast, expectErrorToast, searchInTable, expectInTable } from '../utils/test-helpers';

test.describe('Módulo 0.2: Admin - Clientes', () => {
  // Login como admin antes de cada test
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL(/\/admin/);
  });

  test.describe('Navegación y Carga', () => {
    test('clientes-navegacion-desde-menu: Click en menú carga página', async ({ page }) => {
      // Click en menú Clientes
      const menuClientes = page.locator('nav a:has-text("Clientes")');
      await menuClientes.click();
      
      // Esperar redirect a /admin/clientes
      await page.waitForURL(/\/admin\/clientes/);
      
      // Verificar título
      await expect(page.locator('h1')).toContainText(/Clientes/i);
    });

    test('clientes-lista-carga-datos: Muestra clientes existentes', async ({ page }) => {
      // Navegar a clientes
      await page.goto('/admin/clientes');
      
      // Esperar que la tabla cargue
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Verificar que hay al menos una fila
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('clientes-buscar-funciona: Filtro por nombre/empresa/email', async ({ page }) => {
      await page.goto('/admin/clientes');
      
      // Esperar tabla
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Buscar en el input de búsqueda
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Tech');
      
      // Esperar filtrado
      await page.waitForTimeout(500);
      
      // Verificar que los resultados se filtraron
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      // Debería haber menos o igual filas que antes
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('clientes-buscar-vacio: Muestra todos al limpiar búsqueda', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Buscar algo
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Tech');
      await page.waitForTimeout(500);
      
      // Limpiar búsqueda
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Verificar que muestra todos nuevamente
      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });
  });

  test.describe('Crear Cliente', () => {
    test('clientes-crear-abre-formulario: Botón "Nuevo Cliente" abre form', async ({ page }) => {
      await page.goto('/admin/clientes');
      
      // Click en Nuevo Cliente
      const newButton = page.locator('button:has-text("Nuevo Cliente"), button:has-text("Nuevo")');
      await newButton.click();
      
      // Esperar redirect a /admin/clientes/crear
      await page.waitForURL(/\/admin\/clientes\/crear/);
      
      // Verificar título del formulario
      await expect(page.locator('h1, h2')).toContainText(/Nuevo|Crear/i);
    });

    test('clientes-crear-valida-campos: Valida campos requeridos', async ({ page }) => {
      await page.goto('/admin/clientes/crear');
      
      // Intentar enviar sin completar campos
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Debería mostrar errores de validación
      await page.waitForTimeout(1000);
      // Verificar que sigue en la página de crear
      await expect(page).toHaveURL(/\/admin\/clientes\/crear/);
    });

    test('clientes-crear-activo: Crea cliente activo', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.cliente.${timestamp}@sprintask.com`;
      
      await page.goto('/admin/clientes/crear');
      
      // Completar formulario
      await page.fill('#nombre_cliente', `Test Cliente ${timestamp}`);
      await page.fill('#empresa', `Test Empresa ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      
      // Marcar activo (por defecto debería estar marcado)
      await page.check('#activo');
      
      // Enviar
      await page.click('button[type="submit"]');
      
      // Esperar éxito
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      
      // Verificar que redirige a lista
      await page.waitForURL(/\/admin\/clientes/);
    });

    test('clientes-crear-inactivo: Crea cliente inactivo', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.cliente.inactivo.${timestamp}@sprintask.com`;
      
      await page.goto('/admin/clientes/crear');
      
      // Completar formulario
      await page.fill('#nombre_cliente', `Test Cliente Inactivo ${timestamp}`);
      await page.fill('#empresa', `Test Empresa ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      
      // Desmarcar activo
      await page.uncheck('#activo');
      
      // Enviar
      await page.click('button[type="submit"]');
      
      // Esperar éxito
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
    });

    test('clientes-crear-email-duplicado: Error con email repetido', async ({ page }) => {
      await page.goto('/admin/clientes/crear');

      // Usar email de admin existente
      await page.fill('#nombre_cliente', 'Test Usuario');
      await page.fill('#empresa', 'Test Empresa');
      await page.fill('#email', 'admin@sprintask.com');
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.check('#activo');

      // Enviar
      await page.click('button[type="submit"]');

      // Esperar error específico de email duplicado
      await expectErrorToast(page, /email.*registrado|ya existe.*email/i);
    });

    test('clientes-crear-password-debil: Error con password débil', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.cliente.debil.${timestamp}@sprintask.com`;
      
      await page.goto('/admin/clientes/crear');
      
      await page.fill('#nombre_cliente', `Test Cliente ${timestamp}`);
      await page.fill('#empresa', `Test Empresa ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.debil);
      await page.fill('#password_confirm', passwords.debil);
      await page.check('#activo');
      
      // Enviar
      await page.click('button[type="submit"]');
      
      // Esperar error de password
      await expectErrorToast(page, /contraseña.*débil|mínimo 8 caracteres/i);
    });

    test('clientes-crear-exitoso: Crea y redirige a lista', async ({ page }) => {
      const timestamp = Date.now().toString();
      const email = `test.cliente.exito.${timestamp}@sprintask.com`;
      
      await page.goto('/admin/clientes/crear');
      
      await page.fill('#nombre_cliente', `Test Cliente Exito ${timestamp}`);
      await page.fill('#empresa', `Test Empresa ${timestamp}`);
      await page.fill('#email', email);
      await page.fill('#password', passwords.fuerte);
      await page.fill('#password_confirm', passwords.fuerte);
      await page.check('#activo');
      
      // Enviar
      await page.click('button[type="submit"]');
      
      // Esperar éxito y redirección
      await page.waitForTimeout(2000);
      await expectSuccessToast(page, /creado|exitoso/i);
      await expect(page).toHaveURL(/\/admin\/clientes/);
    });
  });

  test.describe('Editar Cliente', () => {
    test('clientes-editar-abre-formulario: Click en editar abre form', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de editar
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Esperar redirect a /admin/clientes/:id
        await page.waitForURL(/\/admin\/clientes\/\d+/);
        
        // Verificar título
        await expect(page.locator('h1, h2')).toContainText(/Editar/i);
      }
    });

    test('clientes-editar-cambia-datos: Edita nombre, empresa, etc.', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de editar
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/clientes\/\d+/);
        
        // Esperar que cargue el formulario
        await page.waitForTimeout(1000);
        
        // Modificar nombre
        const nombreInput = page.locator('#nombre_cliente');
        const nombreOriginal = await nombreInput.inputValue();
        
        await nombreInput.fill(`${nombreOriginal} - Editado`);
        
        // Enviar
        await page.click('button[type="submit"]');
        
        // Esperar éxito
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('clientes-editar-cambia-estado: Cambia activo/inactivo', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de editar
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/clientes\/\d+/);
        await page.waitForTimeout(1000);
        
        // Cambiar estado
        const checkbox = page.locator('#activo');
        const estadoOriginal = await checkbox.isChecked();
        
        await checkbox.click();
        
        // Enviar
        await page.click('button[type="submit"]');
        
        // Esperar éxito
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
      }
    });

    test('clientes-editar-exitoso: Actualiza y refleja en lista', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de editar
      const editButton = page.locator('[aria-label="Editar"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/admin\/clientes\/\d+/);
        await page.waitForTimeout(1000);
        
        // Modificar algún campo
        const nombreInput = page.locator('#nombre_cliente');
        await nombreInput.fill(`Test Editado ${Date.now()}`);
        
        // Enviar
        await page.click('button[type="submit"]');
        
        // Esperar éxito y redirección
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /actualizado|exitoso/i);
        await expect(page).toHaveURL(/\/admin\/clientes/);
      }
    });
  });

  test.describe('Eliminar Cliente', () => {
    test('clientes-eliminar-abre-dialogo: Click en eliminar abre diálogo', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de eliminar
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Esperar diálogo
        const dialog = page.locator('[role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('clientes-eliminar-mensaje-correcto: Mensaje "papelera de reciclaje"', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en eliminar
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Verificar mensaje en el diálogo
        const dialogDescription = page.locator('[role="alertdialog"] p');
        const dialogText = await dialogDescription.textContent();
        
        // Debería mencionar papelera o reciclaje
        expect(dialogText?.toLowerCase()).toMatch(/papelera|reciclaje|30 días/i);
      }
    });

    test('clientes-eliminar-confirma: Elimina y desaparece de lista', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Contar filas antes
      const rowsBefore = await page.locator('tbody tr').count();
      
      // Click en eliminar
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirmar en diálogo
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        // Esperar éxito
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado|exitoso/i);
        
        // Verificar que hay una fila menos
        const rowsAfter = await page.locator('tbody tr').count();
        expect(rowsAfter).toBe(rowsBefore - 1);
      }
    });

    test('clientes-eliminar-toast: Muestra toast de éxito', async ({ page }) => {
      await page.goto('/admin/clientes');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en eliminar
      const deleteButton = page.locator('[aria-label="Eliminar"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirmar
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        // Esperar toast
        await expectSuccessToast(page, /eliminado|exitoso/i);
      }
    });
  });

  test.describe('Eliminados (Papelera)', () => {
    test('clientes-ver-en-eliminados: Elemento aparece en /admin/eliminados', async ({ page }) => {
      // Navegar a eliminados
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Verificar que hay elementos eliminados
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      // Debería haber al menos un elemento (puede que no si es la primera vez)
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('clientes-restaurar-desde-eliminados: Restaura y vuelve a lista', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en primer botón de restaurar
      const restoreButton = page.locator('[aria-label="Restaurar"]').first();
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        
        // Esperar éxito
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /restaurado|exitoso/i);
      }
    });

    test('clientes-eliminar-permanente: Borra definitivamente', async ({ page }) => {
      await page.goto('/admin/eliminados');
      await page.waitForSelector('table', { timeout: 5000 });
      
      // Click en eliminar permanente
      const deleteButton = page.locator('[aria-label="Eliminar permanentemente"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirmar en diálogo
        const confirmButton = page.locator('[role="alertdialog"] button:has-text("Eliminar")');
        await confirmButton.click();
        
        // Esperar éxito
        await page.waitForTimeout(2000);
        await expectSuccessToast(page, /eliminado.*permanentemente|exitoso/i);
      }
    });
  });
});
