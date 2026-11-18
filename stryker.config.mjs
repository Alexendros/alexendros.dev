/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  $schema: './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: [
    'src/lib/contactHandler.ts',
    'src/lib/contactIdempotency.ts',
    'src/lib/contactSchema.ts'
  ],
  ignorePatterns: [
    '.grok',
    '.vercel',
    '.astro',
    'dist',
    'coverage',
    'docs',
    'specs',
    'public',
    'reports',
    '.lighthouseci',
    'playwright-report',
    'test-results',
    'node_modules/.cache'
  ],
  vitest: {
    configFile: 'vitest.config.ts',
    related: true
  },
  // Primera medición en esta rama: total 47.34 % (2026-11-18). Corte con margen.
  thresholds: {
    high: 60,
    low: 45,
    break: 45
  },
  reporters: ['clear-text', 'progress'],
  timeoutMS: 30_000,
  concurrency: 4,
  ignoreStatic: true,
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
  disableTypeChecks: '{src,tests}/**/*.{ts,tsx,js,jsx,html,vue}'
};

export default config;
