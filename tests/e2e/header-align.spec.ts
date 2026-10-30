import { test, expect } from '@playwright/test';

test('C-06: H1 del hero y logo alineados a 1280 px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const delta = await page.evaluate(() => {
    const logo = document.querySelector('#site-header a[href="/"]');
    const h1 = document.querySelector('[data-hero] h1');
    if (!logo || !h1) return 999;
    return Math.abs(h1.getBoundingClientRect().left - logo.getBoundingClientRect().left);
  });
  expect(delta, `desfase logo/H1 ${delta}px`).toBeLessThanOrEqual(2);
});

test('C-11: cabecera sin wrap de nav a 768 px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/');
  const info = await page.evaluate(() => {
    const header = document.getElementById('site-header');
    const nav = header?.querySelector('nav.site-nav');
    const menu = header?.querySelector('[data-menu-button]');
    const navDisplay = nav ? getComputedStyle(nav).display : 'none';
    const menuDisplay = menu ? getComputedStyle(menu).display : 'none';
    // La cabecera mide `--header-h` + el borde inferior (1px). Comparar contra
    // el token evita umbrales mágicos desalineados con el design system.
    const root = getComputedStyle(document.documentElement);
    const tokenRem = parseFloat(root.getPropertyValue('--header-h'));
    const rootPx = parseFloat(root.fontSize);
    const expectedH = tokenRem * rootPx + 1;
    return {
      headerH: header?.getBoundingClientRect().height ?? 0,
      expectedH,
      navDisplay,
      menuDisplay
    };
  });
  // A 768: menú hamburguesa visible, nav de escritorio oculta y altura de una
  // sola línea (sin wrap): el Container fija h-header y el borde suma 1px.
  expect(info.navDisplay).toBe('none');
  expect(info.menuDisplay).not.toBe('none');
  expect(
    Math.abs(info.headerH - info.expectedH),
    `altura ${info.headerH} vs token ${info.expectedH}px`
  ).toBeLessThanOrEqual(2);
});
