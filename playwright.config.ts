import { defineConfig } from '@playwright/test';

/**
 * IDs de tracker falsos para el build que hace Playwright. Sin ellos
 * `src/lib/tracking/loaders.ts` no inyecta nada (queda detrás de
 * `PUBLIC_*`), así que una puerta de consentimiento correcta y una puerta
 * inexistente serían indistinguibles. Con estos IDs el banco reproduce el
 * wiring real; las peticiones se cortocircuitan en context.route y nunca
 * llegan a la API real. No afecta a producción: no hay secretos, solo IDs
 * de prueba inyectados en el webServer de e2e.
 *
 * VERCEL=1 activa `__IS_VERCEL__` para el perfil P2 (gating de Analytics /
 * Speed Insights). Los scripts /_vercel/* se stubbean en el banco; no hay
 * servicio real de Vercel.
 */
const E2E_TRACKER_ENV = {
  PUBLIC_GA4_ID: 'G-E2E0000001',
  PUBLIC_GTM_ID: 'GTM-E2E0001',
  PUBLIC_META_PIXEL_ID: '111111111111111',
  PUBLIC_CLARITY_ID: 'e2eclarity',
  PUBLIC_POSTHOG_KEY: 'phc_e2e0000000000',
  PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
  PUBLIC_LINKEDIN_PARTNER_ID: '9999999',
  VERCEL: '1'
};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  webServer: {
    command: process.env.SKIP_E2E_BUILD === '1' ? 'pnpm preview' : 'pnpm build && pnpm preview',
    url: 'http://127.0.0.1:4321',
    // Solo reutilizar preview si SKIP_E2E_BUILD=1 (artefacto ya construido con
    // E2E_TRACKER_ENV). Evita servir un build local sin IDs ni __IS_VERCEL__.
    reuseExistingServer: process.env.SKIP_E2E_BUILD === '1',
    timeout: 180_000,
    env: E2E_TRACKER_ENV
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block'
  }
});
