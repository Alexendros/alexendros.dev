import { defineConfig } from '@playwright/test';

/**
 * VERCEL=1 activa `__IS_VERCEL__` para comprobar Analytics / Speed Insights
 * tras consentimiento. Los scripts /_vercel/* se stubbean en el banco.
 * PUBLIC_COOKIE_CONSENT_VERSION=3 alinea el CMP con el inventario v3.
 */
const E2E_TRACKER_ENV = {
  PUBLIC_COOKIE_CONSENT_VERSION: '3',
  VERCEL: '1'
};

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/paquetes-a11y.spec.ts',
  timeout: 60_000,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  webServer: {
    command: process.env.SKIP_E2E_BUILD === '1' ? 'pnpm preview' : 'pnpm build && pnpm preview',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: process.env.SKIP_E2E_BUILD === '1',
    timeout: 300_000,
    env: {
      ...process.env,
      ...E2E_TRACKER_ENV
    }
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry'
  }
});
