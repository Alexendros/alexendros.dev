import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'https://alexendros.dev';
const ROUTES = [
  '/',
  '/servicios',
  '/servicios/software-a-medida',
  '/servicios/informe-comercial',
  '/referencias',
  '/referencias/front-valencia',
  '/referencias/graficas-nasve',
  '/referencias/zedazo',
  '/referencias/alexendros-me',
  '/metodo',
  '/contacto?motivo=propuestaComercial',
  '/experiencia',
  '/identidad',
  '/privacidad',
  '/cookies',
  '/accesibilidad'
];
const VIEWPORTS = [
  { w: 360, h: 740 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 }
];
const SCHEMES = ['light', 'dark'];
const slug = (r) => r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';

await fs.mkdir('audit-out/shots', { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const scheme of SCHEMES)
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: vp.w, height: vp.h }
    });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const rec = { route, scheme, vp: vp.w, consoleErrors: [], failed: [] };
      page.on('console', (m) => m.type() === 'error' && rec.consoleErrors.push(m.text()));
      page.on('requestfailed', (r) => rec.failed.push(`${r.url()} ${r.failure()?.errorText}`));
      page.on('response', (r) => r.status() >= 400 && rec.failed.push(`${r.status()} ${r.url()}`));
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      rec.status = res?.status();
      rec.finalUrl = page.url();
      rec.title = await page.title();
      rec.h1 = await page.$$eval('h1', (n) => n.map((x) => x.textContent.trim()));
      rec.canonical = await page.$eval('link[rel=canonical]', (e) => e.href).catch(() => null);
      rec.skipTarget = await page
        .$eval('a[href^="#"]', (a) => a.getAttribute('href'))
        .catch(() => null);
      rec.cls = await page.evaluate(() => +window.__cls.toFixed(4));
      rec.hOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1
      );
      rec.brokenImgs = await page.$$eval('img', (i) =>
        i.filter((x) => x.complete && x.naturalWidth === 0).map((x) => x.src)
      );
      rec.noAlt = await page.$$eval('img:not([alt])', (i) => i.map((x) => x.src));
      rec.noDims = await page.$$eval('img', (i) =>
        i.filter((x) => !x.getAttribute('width') || !x.getAttribute('height')).map((x) => x.src)
      );
      rec.smallTargets = await page.$$eval(
        'a,button,input,select,textarea,summary,[role=button]',
        (els) =>
          els
            .filter((e) => {
              const r = e.getBoundingClientRect(),
                cs = getComputedStyle(e);
              return (
                r.width > 0 &&
                r.height > 0 &&
                cs.visibility !== 'hidden' &&
                cs.display !== 'inline' &&
                (r.width < 24 || r.height < 24)
              );
            })
            .map((e) => ({
              tag: e.tagName,
              text: (e.textContent || '').trim().slice(0, 40),
              w: Math.round(e.getBoundingClientRect().width),
              h: Math.round(e.getBoundingClientRect().height)
            }))
      );
      rec.dupLinkNames = await page.$$eval('a', (a) => {
        const m = {};
        a.forEach((x) => {
          const t = (x.getAttribute('aria-label') || x.textContent || '').trim().toLowerCase();
          if (t) (m[t] ??= new Set()).add(x.href);
        });
        return Object.entries(m)
          .filter(([, s]) => s.size > 1)
          .map(([t, s]) => ({ name: t, destinations: s.size }));
      });
      rec.dupIds = await page.$$eval('[id]', (e) => {
        const c = {};
        e.forEach((x) => (c[x.id] = (c[x.id] || 0) + 1));
        return Object.keys(c).filter((k) => c[k] > 1);
      });
      rec.axe = (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'])
          .analyze()
      ).violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        sample: v.nodes[0]?.target
      }));
      if (route.startsWith('/contacto') && scheme === 'light' && vp.w === 1440) {
        rec.tabOrder = [];
        for (let i = 0; i < 14; i++) {
          await page.keyboard.press('Tab');
          rec.tabOrder.push(
            await page.evaluate(() => {
              const e = document.activeElement;
              if (!e) return 'none';
              return `${e.tagName.toLowerCase()}[name=${e.getAttribute('name') || ''}] "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}" y=${Math.round(e.getBoundingClientRect().top + scrollY)}`;
            })
          );
        }
      }
      await page.screenshot({
        path: `audit-out/shots/${scheme}-${vp.w}-${slug(route)}.png`,
        fullPage: true
      });
      report.push(rec);
      await page.close();
    }
    await ctx.close();
  }
await browser.close();
await fs.writeFile('audit-out/report.json', JSON.stringify(report, null, 2));

const bad = report.filter(
  (r) =>
    r.status >= 400 ||
    r.hOverflow ||
    r.cls > 0.1 ||
    r.brokenImgs.length ||
    r.axe.some((a) => ['serious', 'critical'].includes(a.impact))
);
console.table(
  bad.map((r) => ({
    route: r.route,
    scheme: r.scheme,
    vp: r.vp,
    status: r.status,
    final: r.finalUrl.replace(BASE, ''),
    overflow: r.hOverflow,
    cls: r.cls,
    axe: r.axe.map((a) => a.id).join(',')
  }))
);
process.exitCode = bad.length ? 1 : 0;
