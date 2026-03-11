import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para SprinTask SaaS
 * - Headless por defecto (más rápido)
 * - 10 workers para ejecución paralela
 * - Timeout de 30 segundos por test
 * - Reportes JSON + HTML
 */

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Un worker para testing inicial
  reporter: [
    ['json', { outputFile: '../docs/test/run-001/00-raw-results.json' }],
    ['html', { outputFolder: '../docs/test/run-001/html-report' }],
    ['list', { printSteps: true }],
  ],
  outputDir: '../docs/test/run-001/test-results',
  timeout: 30000, // 30 segundos por test
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',  // Solo guarda trace si falla
    screenshot: 'off',           // Sin screenshots
    video: 'off',                // Sin video
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
