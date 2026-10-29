/**
 * Capturas de revisión visual de proyectos.
 * Uso: pnpm build && pnpm exec serve .vercel/output/static -l 4321 --no-clipboard &
 *      node scripts/capturas.mjs [--out <dir>]
 * Requiere Playwright instalado (devDependency).
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const OUT = outIndex === -1 ? 'capturas' : (args[outIndex + 1] ?? 'capturas');
const BASE = process.env.CAPTURAS_BASE ?? 'http://127.0.0.1:4321';

const ROUTES = [
  ['proyectos', '/proyectos/'],
  ['front-valencia', '/proyectos/front-valencia/'],
  ['graficas-nasve', '/proyectos/graficas-nasve/'],
  ['zedazo', '/proyectos/zedazo/'],
  ['alexendros-me', '/proyectos/alexendros-me/']
];
const VIEWPORTS = [
  ['320', 320, 900],
  ['390', 390, 900],
  ['768', 768, 1000],
  ['1280', 1280, 900]
];

mkdirSync(OUT, { recursive: true });
const problems = [];
const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  for (const [name, route] of ROUTES) {
    for (const [label, width, height] of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: theme,
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();
      page.on('pageerror', (error) =>
        problems.push(`${route} ${theme} ${label}: ${error.message}`)
      );
      page.on('console', (message) => {
        if (message.type() === 'error')
          problems.push(`${route} ${theme} ${label}: ${message.text()}`);
      });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      // El CMP tapa el contenido inferior: se oculta solo para la captura.
      await page.addStyleTag({ content: '#cc-main{display:none!important}' });
      await page.screenshot({ path: `${OUT}/${name}-${label}-${theme}.png` });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (overflow > 1) problems.push(`OVERFLOW ${route} ${theme} ${label}: +${overflow}px`);
      await context.close();
    }
  }
}

await browser.close();
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `Capturas en ${OUT}: ${ROUTES.length * VIEWPORTS.length * 2} imágenes, sin errores ni overflow.`
);
