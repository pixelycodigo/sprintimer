/**
 * Fixtures de Autenticación para SprinTask SaaS
 * Reutilizables en todos los módulos de testing
 */

import { test as base } from '@playwright/test';
import { existingUsers } from '../fixtures/test-data';

// Tipo para el fixture de autenticación
export type AuthFixture = {
  loginAsAdmin: () => Promise<void>;
  loginAsSuperAdmin: () => Promise<void>;
  loginAsTalent: (email: string, password: string) => Promise<void>;
  loginAsCliente: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Fixture base con autenticación
export const test = base.extend<AuthFixture>({
  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', existingUsers.admin.email);
      await page.fill('input[type="password"]', existingUsers.admin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
    });
  },

  loginAsSuperAdmin: async ({ page }, use) => {
    await use(async () => {
      await page.goto('/login');
      await page.fill('input[type="email"]', existingUsers.superadmin.email);
      await page.fill('input[type="password"]', existingUsers.superadmin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/super-admin/, { timeout: 10000 });
    });
  },

  loginAsTalent: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/talent/, { timeout: 10000 });
    });
  },

  loginAsCliente: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/cliente/, { timeout: 10000 });
    });
  },

  logout: async ({ page }, use) => {
    await use(async () => {
      // Click en menú de usuario y logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout"]');
      await page.waitForURL('/login');
    });
  },
});

export { expect } from '@playwright/test';
