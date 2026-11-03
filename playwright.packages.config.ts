import { defineConfig } from '@playwright/test';

/** Build aislado: with-packages.mjs restaura paquetes.ts al salir. */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/paquetes-a11y.spec.ts',
  timeout: 60_000,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report-packages', open: 'never' }]]
    : 'list',
  webServer: {
    command: 'node tests/e2e/with-packages.mjs',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    timeout: 180_000
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block'
  }
});
