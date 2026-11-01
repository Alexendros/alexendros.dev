import { chromium } from '@playwright/test';
const BASE = process.env.BASE_URL ?? 'https://alexendros.dev';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const r = [];
const check = (name, ok, extra = '') => r.push({ name, ok: !!ok, extra });
await p.goto(`${BASE}/referencias`, { waitUntil: 'networkidle' });
const trigger = p.locator('main a[href^="/referencias/"]').first();
await trigger.focus();
await trigger.press('Enter');
const dlg = p.locator('dialog[open]');
await dlg.waitFor({ timeout: 3000 }).catch(() => {});
check('abre <dialog open>', (await dlg.count()) === 1);
check(
  'foco dentro del dialog',
  await p.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
);
check(
  'dialog con nombre accesible',
  await dlg
    .evaluate((d) => !!(d.getAttribute('aria-label') || d.getAttribute('aria-labelledby')))
    .catch(() => false)
);
check('URL cambia a la ficha', /\/referencias\/[^/]+/.test(p.url()), p.url());
check(
  'scroll de fondo bloqueado',
  await p.evaluate(() =>
    [document.body, document.documentElement].some((e) => getComputedStyle(e).overflow === 'hidden')
  )
);
for (let i = 0; i < 30; i++) await p.keyboard.press('Tab');
check(
  'Tab no escapa del dialog',
  await p.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
);
await p.keyboard.press('Escape');
check('Esc cierra', (await p.locator('dialog[open]').count()) === 0);
check('foco vuelve al disparador', await trigger.evaluate((el) => el === document.activeElement));
check(
  'URL vuelve a /referencias',
  new URL(p.url()).pathname.replace(/\/$/, '') === '/referencias',
  p.url()
);
await trigger.click();
await p.goBack();
check('Atrás del navegador cierra el dialog', (await p.locator('dialog[open]').count()) === 0);
console.table(r);
await b.close();
process.exitCode = r.every((x) => x.ok) ? 0 : 1;
