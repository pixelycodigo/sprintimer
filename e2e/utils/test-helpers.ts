/**
 * Helpers de Testing para SprinTask SaaS
 * Funciones reutilizables para todos los módulos
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Espera y verifica que aparezca un toast de éxito
 */
export async function expectSuccessToast(page: Page, message: string) {
  const toast = page.locator('[data-sonner-toast]');
  await toast.waitFor({ state: 'visible' });
  await expect(toast).toContainText(message);
}

/**
 * Espera y verifica que aparezca un toast de error
 */
export async function expectErrorToast(page: Page, message?: string) {
  const toast = page.locator('[data-sonner-toast]');
  await toast.waitFor({ state: 'visible' });
  if (message) {
    await expect(toast).toContainText(message);
  }
}

/**
 * Abre el diálogo de eliminación para un elemento
 */
export async function openDeleteDialog(page: Page, itemName: string) {
  // Click en botón de eliminar (icono de trash)
  await page.locator(`[aria-label="Eliminar ${itemName}"]`).click();
  
  // Esperar que el diálogo se abra
  const dialog = page.locator('[role="alertdialog"]');
  await dialog.waitFor({ state: 'visible' });
}

/**
 * Confirma la eliminación en el diálogo
 */
export async function confirmDelete(page: Page) {
  const confirmButton = page.locator('[role="alertdialog"] button').filter({ hasText: 'Eliminar' });
  await confirmButton.click();
}

/**
 * Cancela la eliminación en el diálogo
 */
export async function cancelDelete(page: Page) {
  const cancelButton = page.locator('[role="alertdialog"] button').filter({ hasText: 'Cancelar' });
  await cancelButton.click();
}

/**
 * Verifica que un elemento no esté en la tabla
 */
export async function expectNotInTable(page: Page, itemName: string) {
  const row = page.locator('tbody tr').filter({ hasText: itemName });
  const count = await row.count();
  if (count > 0) {
    throw new Error(`El elemento "${itemName}" todavía está en la tabla`);
  }
}

/**
 * Verifica que un elemento esté en la tabla
 */
export async function expectInTable(page: Page, itemName: string) {
  const row = page.locator('tbody tr').filter({ hasText: itemName });
  await row.waitFor({ state: 'visible' });
}

/**
 * Busca en la tabla usando el filtro
 */
export async function searchInTable(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[placeholder*="Buscar"]');
  await searchInput.fill(searchTerm);
  // Pequeña espera para que el filtro se aplique
  await page.waitForTimeout(500);
}

/**
 * Limpia el filtro de búsqueda
 */
export async function clearTableFilter(page: Page) {
  const clearButton = page.locator('button').filter({ hasText: 'Limpiar' });
  if (await clearButton.isVisible()) {
    await clearButton.click();
  } else {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.clear();
  }
  await page.waitForTimeout(500);
}

/**
 * Navega a una página desde el menú lateral
 */
export async function navigateFromMenu(page: Page, menuText: string) {
  // Abrir sidebar si está cerrado
  const sidebarToggle = page.locator('[aria-label="Toggle sidebar"]');
  if (await sidebarToggle.isVisible()) {
    await sidebarToggle.click();
    await page.waitForTimeout(300);
  }
  
  // Click en el item del menú
  const menuItem = page.locator('nav a').filter({ hasText: menuText });
  await menuItem.click();
}

/**
 * Verifica que el Checkbox esté checked/unchecked
 */
export async function expectCheckboxState(page: Page, label: string, checked: boolean) {
  const checkbox = page.locator(`input[type="checkbox"][aria-label="${label}"]`);
  const isChecked = await checkbox.isChecked();
  if (isChecked !== checked) {
    throw new Error(`El checkbox "${label}" debería estar ${checked ? 'checked' : 'unchecked'}`);
  }
}

/**
 * Cambia el estado de un Checkbox
 */
export async function toggleCheckbox(page: Page, label: string) {
  const checkbox = page.locator(`input[type="checkbox"][aria-label="${label}"]`);
  await checkbox.click();
}

/**
 * Genera un email único para testing
 */
export function generateTestEmail(prefix: string) {
  const timestamp = Date.now();
  return `${prefix}.${timestamp}@sprintask.com`;
}

/**
 * Selecciona una opción en un Select de Radix UI (shadcn/ui) por índice
 * 
 * @param page - Página de Playwright
 * @param comboboxIndex - Índice del combobox (0 = primero, 1 = segundo, etc.)
 * @param optionIndex - Índice de la opción a seleccionar (0 = primera, 1 = segunda, etc.)
 * 
 * @example
 * await selectRadixByIndex(page, 0, 0);  // Primer combobox, primera opción
 * await selectRadixByIndex(page, 1, 1); // Segundo combobox, segunda opción
 */
export async function selectRadixByIndex(page: Page, comboboxIndex: number, optionIndex: number) {
  // Click en el combobox por índice
  const combobox = page.locator('[role="combobox"]').nth(comboboxIndex);
  await combobox.click();
  
  // Esperar que haya opciones disponibles
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.waitForTimeout(300);
  
  // Click en la opción por índice
  const option = page.locator('[role="option"]').nth(optionIndex);
  await option.click();
  
  // Esperar que se cierre
  await page.waitForTimeout(300);
}

/**
 * Selecciona una opción en un Select de Radix UI (shadcn/ui) por texto
 * 
 * @param page - Página de Playwright
 * @param optionText - Texto de la opción a seleccionar
 * @param comboboxIndex - Índice del combobox (0 = primero, 1 = segundo, etc.)
 * 
 * @example
 * await selectRadix(page, 'UX Designer', 0);  // Primer combobox, opción 'UX Designer'
 * await selectRadix(page, 'Semi-Senior', 1); // Segundo combobox, opción 'Semi-Senior'
 */
export async function selectRadix(page: Page, optionText: string, comboboxIndex: number = 0) {
  // Click en el combobox por índice
  const combobox = page.locator('[role="combobox"]').nth(comboboxIndex);
  await combobox.click();
  
  // Esperar que haya opciones disponibles
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.waitForTimeout(300);
  
  // Click en la opción por texto
  const option = page.locator('[role="option"]').filter({ hasText: optionText }).first();
  await option.click();
  
  // Esperar que se cierre
  await page.waitForTimeout(300);
}

/**
 * Selecciona una opción en un Select de Radix UI por índice
/**
 * Abre un Select de Radix UI y espera que esté abierto
 * 
 * @param page - Página de Playwright
 * @param triggerText - Texto del trigger para identificar el select
 */
export async function openSelect(page: Page, triggerText: string) {
  const trigger = page.locator(`[role="combobox"]`).filter({ hasText: triggerText }).first();
  await trigger.click();
  await page.waitForSelector('[data-state="open"]', { timeout: 5000 });
  await page.waitForTimeout(300);
}

/**
 * Navega por las opciones de un Select usando el teclado
 * 
 * @param page - Página de Playwright
 * @param direction - 'down' o 'up'
 * @param times - Cantidad de veces (default: 1)
 */
export async function navigateSelect(page: Page, direction: 'down' | 'up', times: number = 1) {
  const key = direction === 'down' ? 'ArrowDown' : 'ArrowUp';
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(100);
  }
}

/**
 * Selecciona la opción actualmente resaltada en un Select
 */
export async function selectHighlightedOption(page: Page) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

/**
 * Cierra un Select abierto presionando Escape
 */
export async function closeSelect(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}
