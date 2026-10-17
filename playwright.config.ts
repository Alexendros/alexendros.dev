import { defineConfig } from '@playwright/test';

/**
 * IDs de tracker falsos para el build que hace Playwright. Sin ellos
 * `src/lib/tracking/loaders.ts` no inyecta nada (queda detrás de
 * `PUBLIC_*`), así que una puerta de consentimiento correcta y una puerta
 * inexistente serían indistinguibles: el navegador no pediría ninguna
 * etiqueta en ninguno de los dos casos. Con estos IDs el banco reproduce el
 * wiring real (GA4, GTM, Meta, Clarity, PostHog, LinkedIn); las peticiones
 * resultantes se cortocircuitan en `page.route` y nunca llegan a la API real.
 * No afecta a producción: aquí no hay secretos, solo identificadores de prueba.
 */
const E2E_TRACKER_ENV = {
  PUBLIC_GA4_ID: 'G-E2E0000001',
  PUBLIC_GTM_ID: 'GTM-E2E0001',
  PUBLIC_META_PIXEL_ID: '111111111111111',
  PUBLIC_CLARITY_ID: 'e2eclarity',
  PUBLIC_POSTHOG_KEY: 'phc_e2e0000000000',
  PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
  PUBLIC_LINKEDIN_PARTNER_ID: '9999999'
};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  webServer: {
    command: process.env.SKIP_E2E_BUILD === '1' ? 'pnpm preview' : 'pnpm build && pnpm preview',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: E2E_TRACKER_ENV
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
