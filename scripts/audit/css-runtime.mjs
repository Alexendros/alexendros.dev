/**
 * Inventario de estilos en ejecución. Requiere un preview local:
 *   pnpm build && pnpm preview
 *   BASE_URL=http://127.0.0.1:4321 pnpm audit:css
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const ROUTES = [
  '/',
  '/servicios/',
  '/referencias/',
  '/referencias/front-valencia/',
  '/metodologia/',
  '/contacto/?motivo=propuestaComercial',
  '/experiencia/'
];

const browser = await chromium.launch();
const out = [];

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1440, height: 900 }
  });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    await page.coverage.startCSSCoverage();
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      scrollTo(0, 0);
    });
    const cov = await page.coverage.stopCSSCoverage();
    const total = cov.reduce((a, e) => a + e.text.length, 0);
    const used = cov.reduce((a, e) => a + e.ranges.reduce((s, r) => s + r.end - r.start, 0), 0);

    const inv = await page.evaluate(() => {
      const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
      const M = () => new Map();
      const fontSize = M();
      const lineHeight = M();
      const fontFamily = M();
      const radius = M();
      const shadow = M();
      const transAll = M();
      const z = M();
      const color = M();
      const bg = M();
      const border = M();

      for (const el of document.body.querySelectorAll('*')) {
        const c = getComputedStyle(el);
        if (c.display === 'none') continue;
        bump(fontSize, c.fontSize);
        bump(lineHeight, c.lineHeight);
        bump(fontFamily, c.fontFamily.split(',')[0].trim());
        if (c.borderRadius !== '0px') bump(radius, c.borderRadius);
        if (c.boxShadow !== 'none') bump(shadow, c.boxShadow);
        if (c.transitionDuration !== '0s' && /\ball\b/.test(c.transitionProperty)) {
          bump(transAll, `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        }
        if (c.zIndex !== 'auto') bump(z, c.zIndex);
        bump(color, c.color);
        if (c.backgroundColor !== 'rgba(0, 0, 0, 0)') bump(bg, c.backgroundColor);
        if (c.borderTopWidth !== '0px') bump(border, c.borderTopColor);
      }

      const root = getComputedStyle(document.documentElement);
      const names = new Set();
      for (const name of root) if (name.startsWith('--')) names.add(name);
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.style)
              for (const name of rule.style) if (name.startsWith('--')) names.add(name);
          }
        } catch {
          /* hoja inaccesible */
        }
      }

      const probe = document.createElement('i');
      document.body.append(probe);
      const tokenSet = new Set();
      for (const name of names) {
        const value = root.getPropertyValue(name).trim();
        if (!/^(#|rgb|hsl|oklch|oklab|lab|lch|color\(|color-mix\()/.test(value)) continue;
        probe.style.color = '';
        probe.style.color = value;
        if (probe.style.color) tokenSet.add(getComputedStyle(probe).color);
      }
      probe.remove();

      const o = (m) => Object.fromEntries([...m].sort((a, b) => b[1] - a[1]));
      const off = (m) => [...m.keys()].filter((k) => !tokenSet.has(k));

      return {
        tokens: names.size,
        fontSize: o(fontSize),
        lineHeight: o(lineHeight),
        fontFamily: o(fontFamily),
        radius: o(radius),
        shadow: o(shadow),
        zIndex: o(z),
        transitionAll: o(transAll),
        offTokenText: off(color),
        offTokenBg: off(bg),
        offTokenBorder: off(border)
      };
    });

    out.push({
      route,
      scheme,
      cssBytes: total,
      unusedPct: total ? +(100 - (used / total) * 100).toFixed(1) : 0,
      ...inv
    });
    await page.close();
  }
  await ctx.close();
}

await browser.close();
await fs.mkdir('audit-out', { recursive: true });
await fs.writeFile('audit-out/css-runtime.json', JSON.stringify(out, null, 2));

console.table(
  out.map((r) => ({
    route: r.route,
    scheme: r.scheme,
    unusedPct: r.unusedPct,
    fontSizes: Object.keys(r.fontSize).length,
    radii: Object.keys(r.radius).length,
    shadows: Object.keys(r.shadow).length,
    z: Object.keys(r.zIndex).join(','),
    transAll: Object.keys(r.transitionAll).length,
    offText: r.offTokenText.length,
    offBg: r.offTokenBg.length
  }))
);
